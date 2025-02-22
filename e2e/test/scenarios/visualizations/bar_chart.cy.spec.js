import {
  restore,
  visitQuestionAdhoc,
  sidebar,
  getDraggableElements,
  moveColumnDown,
  popover,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PEOPLE, PRODUCTS } = SAMPLE_DATABASE;

describe("scenarios > visualizations > bar chart", () => {
  beforeEach(() => {
    restore();
    cy.signInAsNormalUser();
    cy.intercept("POST", "/api/dataset").as("dataset");
  });

  describe("with numeric dimension", () => {
    const query = `
      select null as "a", 10 as "b" union all
      select 5 as "a", 2 as "b" union all
      select 0 as "a", 1 as "b"
    `;

    function getQuestion(visualizationSettings) {
      return {
        dataset_query: {
          type: "native",
          native: { query, "template-tags": {} },
          database: SAMPLE_DB_ID,
        },
        display: "bar",
        visualization_settings: visualizationSettings,
      };
    }

    it("should not show a bar for null values (metabase#12138)", () => {
      visitQuestionAdhoc(
        getQuestion({
          "graph.dimensions": ["a"],
          "graph.metrics": ["b"],
        }),
      );

      cy.findByText("(empty)").should("not.exist");
    });

    it("should show an (empty) bar for null values when X axis is ordinal (metabase#12138)", () => {
      visitQuestionAdhoc(
        getQuestion({
          "graph.dimensions": ["a"],
          "graph.metrics": ["b"],
          "graph.x_axis.scale": "ordinal",
        }),
      );

      cy.findByText("(empty)");
    });
  });

  describe("with binned dimension (histogram)", () => {
    it("should filter out null values (metabase#16049)", () => {
      visitQuestionAdhoc({
        dataset_query: {
          type: "query",
          query: {
            "source-table": ORDERS_ID,
            aggregation: [["count"]],
            breakout: [
              ["field", ORDERS.DISCOUNT, { binning: { strategy: "default" } }],
            ],
          },
          database: SAMPLE_DB_ID,
        },
      });

      cy.get(".bar").should("have.length", 5); // there are six bars when null isn't filtered
      cy.findByText("1,800"); // correct data has this on the y-axis
      cy.findByText("16,000").should("not.exist"); // If nulls are included the y-axis stretches much higher
    });
  });

  describe("with very low and high values", () => {
    it("should display correct data values", () => {
      visitQuestionAdhoc({
        display: "bar",
        dataset_query: {
          type: "native",
          native: {
            query:
              "select '2021-01-01' as x_axis_1, 'A' as x_axis_2, 20000000 as y_axis\n" +
              "union all\n" +
              "select '2021-01-02' as x_axis_1, 'A' as x_axis_2, 19 as y_axis\n" +
              "union all\n" +
              "select '2021-01-03' as x_axis_1, 'A' as x_axis_2, 20000000 as y_axis\n",
          },
          database: SAMPLE_DB_ID,
        },
        visualization_settings: {
          "graph.show_values": true,
          "graph.dimensions": ["X_AXIS_1", "X_AXIS_2"],
          "graph.metrics": ["Y_AXIS"],
        },
      });

      cy.get(".value-labels").should("contain", "19").and("contain", "20.0M");
    });
  });

  describe("with x-axis series", () => {
    beforeEach(() => {
      visitQuestionAdhoc({
        display: "bar",
        dataset_query: {
          type: "query",
          query: {
            "source-table": ORDERS_ID,
            aggregation: [["count"]],
            breakout: [
              ["field", PEOPLE.SOURCE, { "source-field": ORDERS.USER_ID }],
              [
                "field",
                PRODUCTS.CATEGORY,
                { "source-field": ORDERS.PRODUCT_ID },
              ],
            ],
          },
          database: SAMPLE_DB_ID,
        },
      });

      cy.findByTestId("viz-settings-button").click();
      sidebar().findByText("Data").click();
    });

    it("should allow you to show/hide and reorder columns", () => {
      moveColumnDown(getDraggableElements().eq(0), 2);

      getDraggableElements().each((element, index) => {
        const draggableName = element[0].innerText;
        cy.findAllByTestId("legend-item").eq(index).contains(draggableName);
      });

      const columnIndex = 1;

      getDraggableElements()
        .eq(columnIndex)
        .within(() => {
          cy.icon("eye_outline").click();
        });

      getDraggableElements()
        .eq(columnIndex)
        .invoke("text")
        .then(columnName => {
          cy.get(".Visualization").findByText(columnName).should("not.exist");
          cy.findAllByTestId("legend-item").should("have.length", 3);
          cy.get(".enable-dots").should("have.length", 3);
        });

      getDraggableElements()
        .eq(columnIndex)
        .within(() => {
          cy.icon("eye_crossed_out").click();
        });

      getDraggableElements()
        .eq(columnIndex)
        .invoke("text")
        .then(columnName => {
          cy.get(".Visualization").findByText(columnName).should("exist");
          cy.findAllByTestId("legend-item").should("have.length", 4);
          cy.get(".enable-dots").should("have.length", 4);
        });
    });

    it("should gracefully handle removing filtered items, and adding new items to the end of the list", () => {
      moveColumnDown(getDraggableElements().first(), 2);

      getDraggableElements()
        .eq(1)
        .within(() => {
          cy.icon("eye_outline").click();
        });

      cy.findByText("Filter").click();
      cy.findByText("Product").click();

      cy.findByTestId("filter-field-Category").within(() => {
        cy.findByTestId("operator-select").click();
      });

      popover().within(() => {
        cy.findByText("Is not").click();
      });

      cy.findByTestId("filter-field-Category").within(() => {
        cy.findByText("Gadget").click();
      });

      cy.findByText("Apply Filters").click();

      getDraggableElements().should("have.length", 3);

      //Ensures that "Gizmo" is still hidden, so it's state hasn't changed.
      getDraggableElements()
        .eq(0)
        .within(() => {
          cy.icon("eye_crossed_out").click();
        });

      cy.findByTestId("qb-filters-panel").within(() => {
        cy.icon("close").click();
      });

      getDraggableElements().should("have.length", 4);

      //Re-added items should appear at the end of the list.
      getDraggableElements().eq(0).should("have.text", "Gizmo");
      getDraggableElements().eq(3).should("have.text", "Gadget");
    });
  });
});
