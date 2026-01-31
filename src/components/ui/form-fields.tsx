import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: FieldError
    required?: boolean
}

export const FormInput = forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, error, required, className = '', ...props }, ref) => {
        const inputId = props.id || props.name

        return (
            <div>
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    ref={ref}
                    id={inputId}
                    className={`w-full px-4 py-3 rounded-lg border ${error
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-purple-500 focus:border-purple-500'
                        } focus:outline-none focus:ring-2 transition-colors ${className}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {error.message}
                    </p>
                )}
            </div>
        )
    }
)

FormInput.displayName = 'FormInput'

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string
    error?: FieldError
    required?: boolean
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ label, error, required, className = '', ...props }, ref) => {
        const textareaId = props.id || props.name

        return (
            <div>
                <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`w-full px-4 py-3 rounded-lg border ${error
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-purple-500 focus:border-purple-500'
                        } focus:outline-none focus:ring-2 transition-colors resize-none ${className}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${textareaId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {error.message}
                    </p>
                )}
            </div>
        )
    }
)

FormTextarea.displayName = 'FormTextarea'

interface FormSelectProps {
    label: string
    error?: FieldError
    required?: boolean
    options: { value: string; label: string }[]
    name?: string
    id?: string
    disabled?: boolean
    className?: string
    onChange?: React.ChangeEventHandler<HTMLSelectElement>
    onBlur?: React.FocusEventHandler<HTMLSelectElement>
    value?: string
    defaultValue?: string
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ label, error, required, options, className = '', ...props }, ref) => {
        const selectId = props.id || props.name

        return (
            <div>
                <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <select
                    ref={ref}
                    id={selectId}
                    className={`w-full px-4 py-3 rounded-lg border ${error
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-purple-500 focus:border-purple-500'
                        } focus:outline-none focus:ring-2 transition-colors ${className}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${selectId}-error` : undefined}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {error.message}
                    </p>
                )}
            </div>
        )
    }
)

FormSelect.displayName = 'FormSelect'

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: FieldError
    description?: string
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
    ({ label, error, description, className = '', ...props }, ref) => {
        const checkboxId = props.id || props.name

        return (
            <div>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            ref={ref}
                            type="checkbox"
                            id={checkboxId}
                            className={`w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 ${className}`}
                            aria-invalid={error ? 'true' : 'false'}
                            aria-describedby={error ? `${checkboxId}-error` : description ? `${checkboxId}-description` : undefined}
                            {...props}
                        />
                    </div>
                    <div className="ml-3">
                        <label htmlFor={checkboxId} className="text-sm font-medium text-gray-700">
                            {label}
                        </label>
                        {description && (
                            <p id={`${checkboxId}-description`} className="text-xs text-gray-500 mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {error && (
                    <p id={`${checkboxId}-error`} className="mt-1.5 ml-7 text-sm text-red-600 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {error.message}
                    </p>
                )}
            </div>
        )
    }
)

FormCheckbox.displayName = 'FormCheckbox'
