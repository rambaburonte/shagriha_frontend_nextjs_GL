"use client";

import React from "react";
import {
  ControllerRenderProps,
  FieldValues,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit, Plus, X } from "lucide-react";
import { registerPlugin } from "filepond";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

interface FormFieldProps {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "textarea"
    | "number"
    | "select"
    | "switch"
    | "checkbox"
    | "checkbox-group"
    | "radio"
    | "password"
    | "file"
    | "multi-input";
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  isIcon?: boolean;
  singleSelection?: boolean;
  initialValue?: string | number | boolean | string[];
}

export const CustomFormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  options,
  accept,
  className,
  inputClassName,
  labelClassName,
  disabled = false,
  multiple = false,
  maxFiles,
  isIcon = false,
  singleSelection = false,
  initialValue,
}) => {
  const { control } = useFormContext();

  const renderFormControl = (
    field: ControllerRenderProps<FieldValues, string>
  ) => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            {...field}
            value={field.value ?? ""}
            rows={4}
            className={`min-h-28 resize-y border-gray-200 px-3 py-2 ${inputClassName ?? ""}`}
            disabled={disabled}
          />
        );

      case "select":
        return (
          <Select
            value={field.value || (initialValue as string) || ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={`w-full border-gray-200 px-3 py-2 ${inputClassName ?? ""}`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="w-full border-gray-200 bg-white shadow">
              {options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "switch":
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              id={name}
              disabled={disabled}
            />
            <span className="text-sm text-gray-700">{label}</span>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex min-h-9 items-center">
            <Checkbox
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={disabled}
              className="h-5 w-5 border-gray-400 data-[state=checked]:border-secondary-500 data-[state=checked]:bg-secondary-500"
            />
          </div>
        );

      case "checkbox-group": {
        const selectedValues = Array.isArray(field.value) ? field.value : [];

        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {options?.map((option) => {
              const checked = selectedValues.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg bg-white px-3 py-3 text-sm transition hover:bg-secondary-50"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(nextChecked) => {
                      if (singleSelection) {
                        field.onChange(nextChecked === true ? [option.value] : []);
                        return;
                      }

                      field.onChange(
                        nextChecked === true
                          ? [...selectedValues, option.value]
                          : selectedValues.filter(
                              (value: string) => value !== option.value
                            )
                      );
                    }}
                    disabled={disabled}
                    className="border-gray-400 data-[state=checked]:border-secondary-500 data-[state=checked]:bg-secondary-500"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case "radio":
        return (
          <RadioGroup
            value={String(field.value)}
            onValueChange={(value) =>
              field.onChange(
                value === "true" ? true : value === "false" ? false : value
              )
            }
            disabled={disabled}
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            {options?.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <RadioGroupItem
                  value={option.value}
                  className="border-gray-400 text-secondary-500 data-[state=checked]:border-secondary-500 [&_svg]:fill-secondary-500 [&_svg]:text-secondary-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        );

      case "file":
        return (
          <FilePond
            className={inputClassName}
            files={Array.isArray(field.value) ? field.value : []}
            onupdatefiles={(fileItems) => {
              const files = fileItems.map((fileItem) => fileItem.file as File);
              field.onChange(files);
            }}
            allowMultiple={multiple}
            maxFiles={maxFiles}
            acceptedFileTypes={accept ? [accept] : undefined}
            labelIdle={'Drag & Drop your images or <span class="filepond--label-action">Browse</span>'}
            credits={false}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={placeholder}
            {...field}
            value={field.value ?? ""}
            className={`border-gray-200 px-3 py-2 ${inputClassName ?? ""}`}
            disabled={disabled}
          />
        );

      case "multi-input":
        return (
          <MultiInputField
            name={name}
            control={control}
            placeholder={placeholder}
            inputClassName={inputClassName}
          />
        );

      default:
        return (
          <Input
            type={type}
            placeholder={placeholder}
            {...field}
            value={field.value ?? ""}
            className={`border-gray-200 px-3 py-2 ${inputClassName ?? ""}`}
            disabled={disabled}
          />
        );
    }
  };

  const hideOuterLabel = type === "switch";

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={initialValue}
      render={({ field }) => (
        <FormItem className={`relative ${className ?? ""}`}>
          {!hideOuterLabel && (
            <div className="flex items-center justify-between">
              <FormLabel className={`text-sm font-medium ${labelClassName ?? ""}`}>
                {label}
              </FormLabel>
              {!disabled && isIcon && type !== "file" && type !== "multi-input" && (
                <Edit className="h-4 w-4 text-gray-400" />
              )}
            </div>
          )}
          <FormControl>{renderFormControl(field)}</FormControl>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  );
};

interface MultiInputFieldProps {
  name: string;
  control: any;
  placeholder?: string;
  inputClassName?: string;
}

const MultiInputField: React.FC<MultiInputFieldProps> = ({
  name,
  control,
  placeholder,
  inputClassName,
}) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-2">
      {fields.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <FormField
            control={control}
            name={`${name}.${index}`}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholder}
                  className={`flex-1 border-gray-200 px-3 py-2 ${inputClassName ?? ""}`}
                />
              </FormControl>
            )}
          />
          <Button
            type="button"
            onClick={() => remove(index)}
            variant="ghost"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => append("")}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </div>
  );
};
