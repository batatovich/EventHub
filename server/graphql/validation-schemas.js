const Yup = require('yup');

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
        .required('Date is required'),

    capacity: Yup.number()
        .integer('Capacity must be a whole number')
        .min(1, 'Capacity must be at least 1')
        .required('Capacity is required'),

    fee: Yup.number()
        .min(0, 'Fee must be a positive number')
        .required('Fee is required'),
});

module.exports = { CreateEventSchema };
