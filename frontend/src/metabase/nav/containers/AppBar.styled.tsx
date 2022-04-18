import styled from "@emotion/styled";

import { color } from "metabase/lib/colors";
import {
  breakpointMaxSmall,
  breakpointMinSmall,
  space,
} from "metabase/styled-components/theme";

import { APP_BAR_HEIGHT } from "../constants";

export const AppBarRoot = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: ${APP_BAR_HEIGHT};
  background-color: ${color("bg-white")};
  border-bottom: 1px solid ${color("border")};
  z-index: 4;
`;

export const RowLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: calc(50% - 60px);
`;

export const RowRight = styled(RowLeft)`
  justify-content: flex-end;
  width: calc(50% - 60px);
`;

export const LogoIconWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: ${space(1)};

  &:hover {
    background-color: ${color("bg-light")};
  }
`;

export const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 1rem;
  width: 100%;

  ${breakpointMaxSmall} {
    width: 100%;
  }
`;

export const SearchBarContent = styled.div`
  ${breakpointMaxSmall} {
    width: 100%;
  }

  ${breakpointMinSmall} {
    max-width: 300px;
    position: relative;
    width: 100%;
  }
`;
