import {
  inject,
  Injectable,
} from '@angular/core';

import { map } from 'rxjs';

import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';

import { LocalStorageService } from '../../services/local-storage.service';
import {
  addContents,
  contentDeleted,
  createOrUpdateContent,
  deleteContent,
  loadContents,
  updateContent,
} from './content.action';
import { ContentEntity } from './content.selectors';

@Injectable()
export class ContentEffects {
  private actions$ = inject(Actions);
  private localStorageService = inject(LocalStorageService);

  loadContents$ = createEffect(() => this.actions$.pipe(
    ofType(loadContents),
    map(() => {
      const contents = this.localStorageService.get('contents', '[]') ?? [];

      return addContents(contents);
    }),
  ));

  updateContent$ = createEffect(() => this.actions$.pipe(
    ofType(updateContent),
    map(({ content }): ContentEntity => {
      const newContent = { ...content };

      const contentSplit = content.content.split('\n');
      newContent.title = contentSplit[0];

      return newContent;
    }),
    map((content: ContentEntity): ContentEntity => {
      const contents = this.localStorageService.get('contents', '[]') ?? [];

      contents.forEach((c: ContentEntity) => {
        c.selected = false;
      });

      // S'il n'y a pas de contenu, on ajoute au tableau
      if (contents.length === 0) {
        contents.push(content);
      } else {
        // Sinon, on cherche le contenu à modifier
        const index = contents.findIndex((c: ContentEntity) => c.uid === content.uid);

        // Si on ne le trouve pas, on l'ajoute au tableau
        if (index === -1) {
          contents.push(content);
        } else {
          // Sinon, on le modifie
          contents[index] = content;
        }
      };

      this.localStorageService.set('contents', contents);

      return content;
    }),
    map((content: ContentEntity) => createOrUpdateContent(content)),
  ));

  deleteContent$ = createEffect(() => this.actions$.pipe(
    ofType(deleteContent),
    map(({ contents }): ContentEntity[] => {

      const storaredContents = this.localStorageService.get('contents', '[]') ?? [];

      const newContents = storaredContents.filter((c: ContentEntity) => !contents.some((content: ContentEntity) => content.uid === c.uid));

      if (newContents.length > 0) {
        const lastUpdatedAt = newContents.reduce((acc: ContentEntity, current: ContentEntity): ContentEntity => {
          if (acc.updatedAt > current.updatedAt) {
            return acc;
          }

          return current;
        });

        newContents.forEach((c: ContentEntity): void => {
          if (c.uid !== lastUpdatedAt.uid) {
            c.selected = false;
          } else {
            c.selected = true;
          }
        });
      }

      this.localStorageService.set('contents', newContents);

      return newContents;
    }),
    map((contents: ContentEntity[]) => contentDeleted(contents)),
  ));
}
