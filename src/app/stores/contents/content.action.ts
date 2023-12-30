import { createAction } from '@ngrx/store';

import { ContentEntity } from './content.selectors';

export const loadContents = createAction(
  '[Content] Load Contents',
);

export const addContents = createAction(
  '[Content] Add Contents',
  (contents: ContentEntity[]): { contents: ContentEntity[] } => ({ contents }),
);

export const createOrUpdateContent = createAction(
  '[Content] Create Or Update Content',
  (content: ContentEntity): { content: ContentEntity } => ({ content }),
);

export const selectContent = createAction(
  '[Content] Select Content',
  (content: ContentEntity): { content: ContentEntity } => ({ content }),
);

export const updateContent = createAction(
  '[Content] Update Content',
  (content: ContentEntity): { content: ContentEntity } => ({ content }),
);

export const deleteContent = createAction(
  '[Content] Delete Content',
  (contents: ContentEntity[]): { contents: ContentEntity[] } => ({ contents }),
);

export const contentDeleted = createAction(
  '[Content] Content Deleted',
  (contents: ContentEntity[]): { contents: ContentEntity[] } => ({ contents }),
);
