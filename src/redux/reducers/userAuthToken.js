import { 
    ADD_AUTH_TOKEN,
    REMOVE_AUTH_TOKEN, 
} from '../actions';

const initialState = {
    socialAffilAdminToken: null,
    socialAffilAdminEmail: null
}

export const userAuthTokenReducer = (state = initialState, action) => {

    switch(action.type) {
        case ADD_AUTH_TOKEN: {
            state = {
                ...state,
                socialAffilAdminToken: action.payload.token,
                socialAffilAdminEmail: action.payload.email
            }
            break;
        }
        case REMOVE_AUTH_TOKEN: {
            state = {
                ...state,
                socialAffilAdminToken: null,
                socialAffilAdminEmail: null
            }
            break;
        }
        default: {}
    }
    return state;
}