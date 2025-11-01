import { Grid as MuiGrid, GridProps as MuiGridProps, styled } from '@mui/material';

export interface ExtendedGridProps extends MuiGridProps {
  item?: boolean;
  container?: boolean;
}

export const Grid = styled(MuiGrid)<ExtendedGridProps>``;