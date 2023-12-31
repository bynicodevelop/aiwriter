import { JsonPipe } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  debounceTime,
  of,
} from 'rxjs';

import {
  LetDirective,
  PushPipe,
} from '@ngrx/component';

import { EditorComponent } from './components/editor/editor.component';
import {
  DeleteButtonComponent,
} from './components/shared/button/delete-button/delete-button.component';
import {
  LongPressDirective,
} from './components/shared/directives/long-press.directive';
import { ItemComponent } from './components/shared/item/item.component';
import { SortPipe } from './components/shared/pipes/sort.pipe';
import { ContentFacade } from './stores/contents/content.facade';
import { ContentEntity } from './stores/contents/content.selectors';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    EditorComponent,
    ItemComponent,
    DeleteButtonComponent,
    PushPipe,
    LetDirective,
    SortPipe,
    LongPressDirective,
    JsonPipe,
    ReactiveFormsModule
  ],
  providers: [
    ContentFacade
  ],
})
export class AppComponent implements OnInit {
  private contentFacade = inject(ContentFacade);

  protected contents$ = this.contentFacade.contents$;
  protected content$ = this.contentFacade.content$;

  protected editing$ = of(false);
  protected loading$ = of(false);

  form = new FormGroup({
    options: new FormArray<FormControl<{
      content: ContentEntity;
      selected: boolean;
    } | null>>([])
  });

  ngOnInit(): void {
    this.contentFacade.loadContents();

    this.contents$
      .pipe(
        debounceTime(300),
      )
      .subscribe((contents): void => {
        // Si le nombre de contenus a changé, on réinitialise le formulaire
        if (contents.length !== this.form.controls.options.value.length) {
          this.editing$ = of(false);
          this.loading$ = of(false);
          this.form.controls.options.reset();
        }

        contents.forEach((content): void => {
          // Si un contenu est déjà présent dans le formulaire, on ne l'ajoute pas
          const existingControl = this.form.controls.options.value.find((option): boolean => option?.content.uid === content.uid);

          if (existingControl) {
            // Si un contenu est présent dans le tableau et dans le formulaire, on ne fait rien
            return;
          }

          this.form.controls.options.push(
            new FormControl({
              content,
              selected: false,
            })
          );
        });
      })
  }

  protected onSelectContent(content: ContentEntity): void {
    this.contentFacade.selectContent(content);
  }

  protected onValueChange(value: ContentEntity): void {
    this.contentFacade.updateContent(value);
  }

  protected longPress(): void {
    this.editing$ = of(true);
  }

  protected toggleSelection(content: ContentEntity): void {
    this.form.controls.options.value.forEach((option): void => {
      if (option?.content.uid === content.uid) {
        option.selected = true;
      }
    });
  }

  protected deleteItem(): void {
    const listOfContents = this.form.controls.options.value
      .filter((option): boolean => option?.selected === true)
      .map((option): ContentEntity => option?.content as ContentEntity);

    this.contentFacade.deleteContent(listOfContents);

    this.loading$ = of(true);
  }

  @HostListener('window:keydown', ['$event'])
  private onKeyDown(event: KeyboardEvent): void {
    if (event.metaKey && event.key === 'o') {
      console.log('open file')
    }
  }
}
