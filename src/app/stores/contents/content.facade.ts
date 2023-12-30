import {
  inject,
  Injectable,
} from '@angular/core';

import { Store } from '@ngrx/store';

import {
  addContents,
  deleteContent,
  loadContents,
  selectContent,
  updateContent,
} from './content.action';
import {
  ContentEntity,
  selectAllContents,
  selectContent as contentSelector,
} from './content.selectors';

@Injectable()
export class ContentFacade {
  private store = inject(Store);

  contents$ = this.store.select(selectAllContents);

  content$ = this.store.select(contentSelector);

  loadContents(): void {
    this.store.dispatch(loadContents());
  }

  addContents(contents: ContentEntity[]): void {
    this.store.dispatch(addContents(contents));
  }

  selectContent(content: ContentEntity): void {
    this.store.dispatch(selectContent(content));
  }

  updateContent(content: ContentEntity): void {
    this.store.dispatch(updateContent(content));
  }

  deleteContent(contents: ContentEntity[]): void {
    this.store.dispatch(deleteContent(contents));
  }
}
