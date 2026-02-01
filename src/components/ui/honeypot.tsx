import React from 'react';

/**
 * Honeypot component to protect forms from bots.
 * This field is hidden from legitimate users but often filled by automated bots.
 * If the field is filled on submission, the request should be rejected.
 */
export const Honeypot = React.forwardRef<HTMLInputElement, { name?: string }>(
    ({ name = 'website_url' }, ref) => {
        return (
            <div style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor={name}>Leave this field empty</label>
                <input
                    ref={ref}
                    type="text"
                    id={name}
                    name={name}
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>
        );
    }
);

Honeypot.displayName = 'Honeypot';
