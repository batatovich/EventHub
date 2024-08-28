import React from 'react';

const FormInput = ({ label, type, name, value, onChange, error, required = false }) => {
    return (
        <div className="mb-4">
            <label>{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full p-2 border rounded"
                required={required}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

export default FormInput;