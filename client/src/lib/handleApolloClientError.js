const handleApolloClientError = (error) => {
    if (error.graphQLErrors) {
        error.graphQLErrors.forEach((err) => {
            if (err.extensions?.code === 'BAD_USER_INPUT') {
                console.error('Validation Error:', err.message);
                displayErrorMessage('There was a validation error: ' + err.message);
            } else if (err.extensions?.code === 'INTERNAL_SERVER_ERROR') {
                console.error('Server Error:', err.message);
                displayErrorMessage('An internal server error occurred. Please try again later.');
            } else {
                console.error('GraphQL Error:', err.message);
                displayErrorMessage('An error occurred: ' + err.message);
            }
        });
    } else if (error.networkError) {
        console.error('Network Error:', error.networkError.message);
        displayErrorMessage('A network error occurred. Please check your connection.');
    } else {
        console.error('Unexpected Error:', error);
        displayErrorMessage('An unexpected error occurred. Please try again.');
    }
};

const displayErrorMessage = (message) => {
    alert(message);
};

export default handleApolloClientError;