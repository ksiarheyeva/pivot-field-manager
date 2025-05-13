import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { zodResolver } from '@hookform/resolvers/zod';
import Editor, { OnMount } from '@monaco-editor/react';
import { AArrowDown, AArrowUp, Plus, Save, Search } from 'lucide-react';
import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FieldConfig, usePivotConfig, ZoneType } from '../config/ConfigContext';
import FieldItem from '../items/FieldItem';

function FieldZone({ type }: { type: ZoneType }) {
  const {
    getFieldsForZone,
    updateZoneFields,
    addNewField,
    fields: originFields,
  } = usePivotConfig();
  const { setNodeRef, isOver } = useDroppable({ id: type });

  const fields = getFieldsForZone(type);
  console.log(fields, 'fields');

  const originalRef = useRef<FieldConfig[]>([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const [sortState, setSortState] = useState<'default' | 'asc' | 'desc'>('default');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Update originalRef: add only new fields
  useEffect(() => {
    const currentIds = new Set(fields.map((f) => f.id));
    const originalIds = new Set(originalRef.current.map((f) => f.id));

    const addedFields = fields.filter((f) => !originalIds.has(f.id));
    const removedFields = originalRef.current.filter((f) => !currentIds.has(f.id));

    if (addedFields.length > 0 || removedFields.length > 0) {
      // Add to the end of the originalRef
      originalRef.current = [
        ...originalRef.current.filter((f) => currentIds.has(f.id)), // clean up deleted
        ...addedFields, // add new fileds to the end
      ];
    }
  }, [fields]);

  function sortFields(
    fields: FieldConfig[],
    sortState: 'default' | 'asc' | 'desc',
    original?: FieldConfig[],
  ): FieldConfig[] {
    if (sortState === 'asc') {
      return [...fields].sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortState === 'desc') {
      return [...fields].sort((a, b) => b.id.localeCompare(a.id));
    } else {
      const orderMap = new Map(original?.map((f, idx) => [f.id, idx]));

      return [...fields].sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    }
  }

  // Auto-apply sorting when moving/adding
  useEffect(() => {
    if (sortState !== 'default') {
      const sorted = sortFields(fields, sortState, originalRef.current);
      updateZoneFields(type, sorted);
    }
  }, [fields.length]);

  function toggleSort() {
    const next = sortState === 'default' ? 'asc' : sortState === 'asc' ? 'desc' : 'default';

    setSortState(next);
    const sorted = sortFields(fields, next, originalRef.current);
    updateZoneFields(type, sorted);
  }

  const filteredFields = fields.filter((field) =>
    field.id.toLowerCase().includes(search.toLowerCase()),
  );

  const formSchema = z.object({
    id: z
      .string()
      .min(2, { message: 'Field name must be at least 2 characters.' })
      .max(50)
      .refine((val) => !fields.find((field) => field.id === val), {
        message: 'Field already exists',
      }),
    expression: z.string().min(2, {
      message: 'Expression must be at least 2 characters.',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      expression: '',
    },
    mode: 'onChange',
  });

  const { reset, handleSubmit, formState, control } = form;

  const { errors, isDirty, isValid } = formState;
  const isButtonDisabled = !isDirty || !isValid;

  // useEffect(() => {
  //   if (open) {
  //     reset({ id: 'New Field 1', expression: '' }); // setting default values
  //     form.trigger('id'); // validation of Id field on opening (.refine)
  //   }
  // }, [open, reset, form]);

  function handleDialogOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) reset();
  }

  function onSubmit(fieldConfig: z.infer<typeof formSchema>) {
    addNewField(fieldConfig, type);
    reset();
    setOpen(false);
  }

  useDndMonitor({
    onDragStart(event) {
      setActiveId(event.active.id as string);
    },
    onDragEnd() {
      setActiveId(null);
    },
    onDragCancel() {
      setActiveId(null);
    },
  });

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoInstance.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: monaco.languages.CompletionItem[] = [
          {
            label: 'print',
            kind: monacoInstance.languages.CompletionItemKind.Function,
            insertText: 'print(${1:message})',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Prints a message to the console',
            range,
          },
          {
            label: 'def',
            kind: monacoInstance.languages.CompletionItemKind.Keyword,
            insertText: 'def ${1:function_name}(${2:params}):\n\t$0',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Defines a new function',
            range,
          },
          {
            label: 'if',
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: 'if ${1:condition}:\n\t$0',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'If statement',
            range,
          },
        ];

        return { suggestions };
      },
    });
  };

  const insertTextIntoEditor = (text: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus(); // it is required that the position is not null

      const position = editor.getPosition();

      if (position) {
        const range = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column,
        );

        editor.executeEdits('', [
          {
            range,
            text,
            forceMoveMarkers: true,
          },
        ]);

        // Scroll to new cursor position
        editor.setPosition({
          lineNumber: position.lineNumber,
          column: position.column + text.length,
        });

        editor.revealPositionInCenterIfOutsideViewport({
          lineNumber: position.lineNumber,
          column: position.column + text.length,
        });
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] flex flex-col h-full border overflow-hidden rounded transition-colors ${isOver ? 'bg-gray-100' : 'bg-white'}`}
    >
      <div className="sticky top-0 z-10 bg-white p-2 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold capitalize select-none px-1">{type}</h3>

          {/* ----- create dialog form*/}
          {type === 'available' && (
            <Dialog open={open} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus />
                  New field
                </Button>
              </DialogTrigger>

              <DialogContent className="w-full max-w-[90vw] sm:max-w-[500px] ">
                <DialogHeader>
                  <DialogTitle>Add new field</DialogTitle>
                  <DialogDescription>
                    Create a new field. Click save when you are finished.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="New field" {...field} autoFocus={true} />
                          </FormControl>
                          {errors.id && <FormMessage>{errors.id.message}</FormMessage>}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="expression"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-4">
                              <div className="w-1/2 h-[25vh] max-w-full overflow-hidden shadow-xs rounded-md border  py-4 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] duration-200">
                                <Editor
                                  {...field}
                                  defaultLanguage="python"
                                  options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                  }}
                                  onMount={handleEditorDidMount}
                                  className="w-full"
                                />
                              </div>
                              <div className="w-1/2 rounded-md border p-4 h-[25vh] overflow-auto">
                                {originFields.map((field) => (
                                  <div
                                    key={field.id}
                                    className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-muted cursor-pointer group"
                                    onClick={() => insertTextIntoEditor(field.id)}
                                  >
                                    <span className="text-sm">{field.id}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        insertTextIntoEditor(field.id);
                                      }}
                                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </FormControl>
                          {errors.expression && (
                            <FormMessage>{errors.expression.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button variant="outline" disabled={isButtonDisabled}>
                        <Save />
                        Save
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}

          {fields.length > 1 ? (
            <div className="flex gap-2 ml-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Field search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleSort}
                className={sortState === 'default' ? 'opacity-40' : 'text-accent-500'}
                disabled={fields.length === 0 || fields.length === 1}
              >
                {sortState === 'default' && <AArrowUp className="w-4 h-4" />}
                {sortState === 'asc' && <AArrowUp className="w-4 h-4" />}
                {sortState === 'desc' && <AArrowDown className="w-4 h-4" />}
              </Button>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 ">
        {fields.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic select-none">
            No fields
          </div>
        )}

        {search !== '' && filteredFields.length === 0 ? (
          <div className="text-sm text-muted-foreground italic select-none">Not found</div>
        ) : (
          <>
            {filteredFields.map((field) =>
              field.id === activeId ? null : <FieldItem key={field.id} field={field} zone={type} />,
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FieldZone;
