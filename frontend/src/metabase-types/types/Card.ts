import { DatabaseId } from "./Database";
import { StructuredQuery, NativeQuery } from "./Query";
import { Parameter, ParameterInstance } from "./Parameter";

export type CardId = number;

export type VisualizationSettings = {
  [key: string]: any;
};

export type UnsavedCard<Q = DatasetQuery> = {
  dataset_query: Q;
  display: string;
  visualization_settings: VisualizationSettings;
  parameters?: Array<Parameter>;

  // If coming from dashboard
  dashboardId?: number;
  dashcardId?: number;

  // Not part of the card API contract, a field used by query builder for showing lineage
  original_card_id?: CardId;
};

export type SavedCard<Q = DatasetQuery> = UnsavedCard<Q> & {
  id: CardId;
  name?: string;
  description?: string;
  dataset?: boolean;
  collection_id: number | null;
  can_write: boolean;
  public_uuid: string;
  archived?: boolean;
};

export type Card<Q = DatasetQuery> = SavedCard<Q> | UnsavedCard<Q>;

export type StructuredDatasetQuery = {
  type: "query";
  database?: DatabaseId;
  query: StructuredQuery;
  parameters?: Array<ParameterInstance>;
};

export type NativeDatasetQuery = {
  type: "native";
  database?: DatabaseId;
  native: NativeQuery;
  parameters?: Array<ParameterInstance>;
};

/**
 * All possible formats for `dataset_query`
 */
export type DatasetQuery = StructuredDatasetQuery | NativeDatasetQuery;
