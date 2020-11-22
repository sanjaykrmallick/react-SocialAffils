import { 
    ADD_AUTH_TOKEN,
    REMOVE_AUTH_TOKEN
} from './action-types';

export const addAuthToken = (token,email) => {
    return {
        type: ADD_AUTH_TOKEN,
        payload: {
            token,
            email
        }
    }
}

export const removeAuthToken = () => {
    return {
        type: REMOVE_AUTH_TOKEN,
        payload: {}
    }
}
