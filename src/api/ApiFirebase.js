import axios from 'axios';

const firebase_api = axios.create({
    baseURL: 'https://extramuraleseb-default-rtdb.firebaseio.com/', // importante la barra final
    headers: {
        'Content-Type': 'application/json'
    }
});

export default firebase_api;
