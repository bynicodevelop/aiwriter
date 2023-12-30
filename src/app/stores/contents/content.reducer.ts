import {
  createEntityAdapter,
  EntityState,
} from '@ngrx/entity';
import {
  createReducer,
  on,
} from '@ngrx/store';

import {
  addContents,
  contentDeleted,
  createOrUpdateContent,
  deleteContent,
  selectContent,
  updateContent,
} from './content.action';
import { ContentEntity } from './content.selectors';

export const contentFeatureKey = 'content';

export type StateContent = EntityState<ContentEntity>;

export const contentAdapter = createEntityAdapter<ContentEntity>({
  selectId: (content: ContentEntity): string => content.uid,
});

export const initialState: StateContent = contentAdapter.getInitialState();

export const contentReducer = createReducer(
  initialState,
  on(addContents, (state, { contents }) => contentAdapter.addMany(contents, state)),
  on(createOrUpdateContent, (state, { content }) => contentAdapter.upsertOne(content, state)),
  on(selectContent, (state, { content }) => {
    // Trouver l'élément actuellement sélectionné
    const currentSelectedId = state.ids.find(id => state.entities[id]?.selected);
    const currentSelected = currentSelectedId ? state.entities[currentSelectedId] : undefined;

    // Créer un tableau pour les mises à jour
    const updates = [];

    // Si un élément est actuellement sélectionné, ajouter une mise à jour pour le désélectionner
    if (currentSelected) {
      updates.push({
        id: currentSelected.uid,
        changes: {
          selected: false,
        },
      });
    }

    if (!updates.length) {
      return state;
    }

    // Ajouter une mise à jour pour sélectionner le nouvel élément
    updates.push({
      id: content.uid,
      changes: {
        selected: true,
      },
    });

    // Effectuer les mises à jour
    return contentAdapter.updateMany(updates, state);
  }),
  on(updateContent, (state, { content }): StateContent => contentAdapter.updateOne({
    id: content.uid,
    changes: content,
  }, state)),
  on(deleteContent, (state, { contents }): StateContent => contentAdapter.removeMany(contents.map(content => content.uid), state)),
  on(contentDeleted, (state, { contents }): StateContent => contentAdapter.setAll(contents, state)),
);
