import * as Yup from 'yup';

const SignUpSchema = Yup.object().shape({
    email: Yup.string()
        .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Invalid email format'
        )
        .required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[@$!%*?&#]/, 'Password must contain at least one special character: @$!%*?&#')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
});

const SignInSchema = Yup.object().shape({
    email: Yup.string()
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required'),
});

const CreateEventSchema = Yup.object().shape({
    name: Yup.string()
        .max(50, 'Name must be at most 50 characters')
        .required('Event name is required'),

    description: Yup.string()
        .max(200, 'Description must be at most 200 characters')
        .required('Description is required'),

    location: Yup.string()
        .max(50, 'Location must be at most 50 characters')
        .required('Location is required'),

    date: Yup.date()
        .min(new Date(), 'Date must be in the future')
        .required('Date is required'),

    capacity: Yup.number()
        .integer('Capacity must be a whole number')
        .min(1, 'Capacity must be at least 1')
        .required('Capacity is required'),

    fee: Yup.number()
        .min(0, 'Fee must be a positive number')
        .required('Fee is required'),
});

export { SignUpSchema, SignInSchema, CreateEventSchema };
