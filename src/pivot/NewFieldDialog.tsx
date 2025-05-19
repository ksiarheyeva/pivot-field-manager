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
import { zodResolver } from '@hookform/resolvers/zod';
import Editor, { OnMount } from '@monaco-editor/react';
import { Plus, Save } from 'lucide-react';
import * as monaco from 'monaco-editor';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { usePivotConfig, ZoneType } from './config/ConfigContext';

function NewFieldDialog({ type }: { type: ZoneType }) {
  const { addNewField, getFieldsForZone, fields: originFields } = usePivotConfig();
  const fields = getFieldsForZone(type);

  const [open, setOpen] = useState(false);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  // Create ref once in the component
  const completionProviderRef = useRef<monaco.IDisposable | null>(null);

  function handleDialogOpenChange(isOpen: boolean) {
    setOpen(isOpen);

    if (!isOpen) {
      reset();
      // Cleaning the Monaco editor
      completionProviderRef.current?.dispose();
    }
  }

  function onSubmit(fieldConfig: z.infer<typeof formSchema>) {
    addNewField(fieldConfig, type);
    reset();
    setOpen(false);
  }

  const formSchema = z.object({
    id: z
      .string()
      .min(2, { message: 'Field name must be at least 2 characters.' })
      .max(50)
      .refine((val) => !fields.some((field) => field.id === val), {
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

  //Function for mounting the editor
  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    // Remove the old provider, if any
    if (completionProviderRef.current) {
      completionProviderRef.current.dispose();
      // console.log('Old provider disposed');
    }

    completionProviderRef.current = monacoInstance.languages.registerCompletionItemProvider(
      'python',
      {
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
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Prints a message to the console',
              range,
            },
            {
              label: 'def',
              kind: monacoInstance.languages.CompletionItemKind.Keyword,
              insertText: 'def ${1:function_name}(${2:params}):\n\t$0',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Defines a new function',
              range,
            },
            {
              label: 'if',
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: 'if ${1:condition}:\n\t$0',
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'If statement',
              range,
            },
          ];
          console.log(suggestions, 'suggestions');

          return { suggestions };
        },
      },
    );
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
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          New field
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-xl m-auto sm:max-w-5xl ">
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
                      <div className="w-2/3 h-[25vh] max-w-full overflow-hidden shadow-xs rounded-md border  py-4 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] duration-200">
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
                      <div className="w-1/3 rounded-md border p-4 h-[25vh] overflow-auto">
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
                  {errors.expression && <FormMessage>{errors.expression.message}</FormMessage>}
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
  );
}

export default NewFieldDialog;
