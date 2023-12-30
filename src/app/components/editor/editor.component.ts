import { JsonPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

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
  @Input({
    required: true,
  }) defaultValue!: ContentEntity | undefined;

  @Input() placeholderContent = 'Entrez du texte ici...';

  @ViewChild('editorRef') editorRef!: ElementRef<HTMLDivElement>;
  @ViewChild('placeholder') placeholder!: ElementRef<HTMLDivElement>;

  @Output() valueChange = new EventEmitter<ContentEntity>();

  protected content = new EventEmitter<ContentEntity>();
  protected hasContent = false;

  private cdr = inject(ChangeDetectorRef);

  private editor!: Editor;

  @HostListener('window:keydown', ['$event'])
  private onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'n') {
      this.content.emit(this.createNewContent());
    }
  }

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultValue'] && changes['defaultValue'].currentValue?.uid !== changes['defaultValue'].previousValue?.uid) {
      this.content.emit(changes['defaultValue'].currentValue ?? this.createNewContent());
    }
  }

  ngOnInit(): void {
    this.content.subscribe((content): void => {
      if (this.editor) {
        this.editor.destroy();
      }

      this.setEditorContent(content ?? this.createNewContent());

      this.hasContent = content.content.length > 0;
    });

    this.valueChange.subscribe((content): void => {
      this.hasContent = content.content.length > 0;
    })
  }

  ngAfterViewInit(): void {
    if (!this.editor) {
      this.content.emit(this.defaultValue ?? this.createNewContent());
      this.cdr.detectChanges();
    }
  }

  private setEditorContent(contentEntity: ContentEntity): void {
    this.editor = Editor.make().config((ctx: Ctx): void => {
      ctx.set(rootCtx, this.editorRef.nativeElement);
      ctx.set(defaultValueCtx, contentEntity.content);

      ctx.update(editorViewOptionsCtx, (prev) => ({
        ...prev,
        attributes: { class: 'mx-auto outline-none prose pb-20 cursor-text', spellcheck: 'false' },
      }))

      ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, _prevMarkdown): void => {
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
    this.content.unsubscribe();
    this.valueChange.unsubscribe();

    if (this.editor) {
      this.editor.destroy();
    }
  }
}
