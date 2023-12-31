import { JsonPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { of } from 'rxjs';

import {
  defaultValueCtx,
  Editor,
  editorViewOptionsCtx,
  rootCtx,
} from '@milkdown/core';
import { Ctx } from '@milkdown/ctx';
import { history } from '@milkdown/plugin-history';
import {
  listener,
  listenerCtx,
} from '@milkdown/plugin-listener';
import {
  commonmark,
  headingAttr,
} from '@milkdown/preset-commonmark';
import { Node } from '@milkdown/prose/model';
import { PushPipe } from '@ngrx/component';

import { ContentEntity } from '../../stores/contents/content.selectors';

@Component({
  selector: 'app-editor',
  standalone: true,
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  imports: [
    PushPipe,
    JsonPipe,
  ],
})
export class EditorComponent implements OnInit, OnChanges {
  @Input() placeholderContent = 'Entrez du texte ici...';

  @ViewChild('editorRef') editorRef!: ElementRef<HTMLDivElement>;

  @Output() valueChange = new EventEmitter<ContentEntity>();

  @Input()
  set value(content: ContentEntity) {
    if (this.control.value?.uid !== content?.uid) {
      this.control.setValue(content);
    }
  }

  @Input()
  createNew$ = of(false);

  protected hasContent = false;

  private cdr = inject(ChangeDetectorRef);
  private editor!: Editor;
  private control = new FormControl();

  private createNewContent(): ContentEntity {
    const date = new Date().getTime();

    return {
      uid: date.toString(),
      title: '',
      content: '',
      selected: true,
      createdAt: date,
      updatedAt: date,
    };
  }

  ngOnChanges(): void {
    this.createNew$.subscribe((createNew: boolean): void => {
      if (createNew) {
        this.control.setValue(this.createNewContent());
      }
    });
  }

  ngOnInit(): void {
    this.control.valueChanges.subscribe((content: ContentEntity): void => {
      if (this.editor) {
        this.editor.destroy();
      }

      this.setEditorContent(content ?? this.createNewContent());
    })
  }

  ngAfterViewInit(): void {
    if (!this.editor) {
      this.setEditorContent(this.control.value ?? this.createNewContent());

      this.cdr.detectChanges();
    }
  }

  private setEditorContent(contentEntity: ContentEntity): void {
    this.editor = Editor.make().config((ctx: Ctx): void => {
      ctx.set(rootCtx, this.editorRef.nativeElement);
      ctx.set(defaultValueCtx, contentEntity.content);

      this.hasContent = contentEntity.content.length > 0;

      ctx.update(editorViewOptionsCtx, (prev) => ({
        ...prev,
        attributes: { class: 'mx-auto outline-none prose pb-20 cursor-text', spellcheck: 'false' },
      }))

      ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, _prevMarkdown): void => {
        this.hasContent = markdown.length > 0;

        this.valueChange.emit({
          ...contentEntity,
          content: markdown,
          updatedAt: new Date().getTime(),
        });
      });

      ctx.set(headingAttr.key, (node: Node): Record<string, string> => {
        const level = node.firstChild?.type.name === 'text' ? 1 : node.firstChild?.attrs['level'];

        if (level === 1) return { class: 'text-4xl', 'data-el-type': 'h1' };
        if (level === 2) return { class: 'text-3xl', 'data-el-type': 'h2' };

        return {}
      });
    })
      .use(commonmark)
      .use(history)
      .use(listener);

    this.editor.create();
  }

  ngOnDestroy(): void {
    this.valueChange.unsubscribe();
    this.cdr.detach();

    if (this.editor) {
      this.editor.destroy();
    }
  }
}
