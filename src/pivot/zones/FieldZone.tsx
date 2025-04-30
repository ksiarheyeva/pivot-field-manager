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
import { Textarea } from '@/components/ui/textarea';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { AArrowDown, AArrowUp, Plus, Save, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FieldConfig, usePivotConfig, ZoneType } from '../config/ConfigContext';
import FieldItem from '../items/FieldItem';

function FieldZone({ type }: { type: ZoneType }) {
  const { getFieldsForZone, updateZoneFields, addNewField } = usePivotConfig();
  const { setNodeRef, isOver } = useDroppable({ id: type });

  const fields = getFieldsForZone(type);
  const originalRef = useRef<FieldConfig[]>([]);

  const [sortState, setSortState] = useState<'default' | 'asc' | 'desc'>('default');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Update originalRef: add only new fields
  useEffect(() => {
    if (originalRef.current.length === 0) {
      originalRef.current = [...fields];
      return;
    }

    const currentIds = new Set(originalRef.current.map((f) => f.id));
    const newFields = fields.filter((f) => !currentIds.has(f.id));

    if (newFields.length > 0) {
      originalRef.current = [...originalRef.current, ...newFields];
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
      return original ?? fields;
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
      id: 'New Field 1',
      expression: '',
    },
    mode: 'onChange',
  });

  const { reset, handleSubmit, formState, control } = form;
  const { errors, isDirty, isValid } = formState;
  const isButtonDisabled = !isDirty || !isValid;

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

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] flex flex-col h-full border overflow-hidden rounded transition-colors ${isOver ? 'bg-gray-100' : 'bg-white'}`}
    >
      <div className="sticky top-0 z-10 bg-white p-2 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold capitalize select-none">{type}</h3>

          {/* ----- create dialog form*/}
          {type === 'available' && (
            <Dialog open={open} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus />
                  New field
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[500px]">
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
                            <Input placeholder="New field" {...field} />
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
                            <Textarea placeholder="Expression" {...field} />
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
          <div className="text-sm text-muted-foreground italic select-none">No fields</div>
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
