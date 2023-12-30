import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

import {
  contentAdapter,
  contentFeatureKey,
  StateContent,
} from './content.reducer';

const { selectAll, } = contentAdapter.getSelectors();

export type ContentEntity = {
  uid: string;
  title: string;
  content: string;
  selected?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  contents: ContentEntity[];
}

export const selectContentState =
  createFeatureSelector<StateContent>(contentFeatureKey);

export const selectAllContents = createSelector(selectContentState, selectAll);

export const selectContent = (createSelector(selectContentState, (state: StateContent) => selectAll(state).find((content: ContentEntity) => content.selected)));
