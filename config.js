exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://Admin:admin123@ds135993.mlab.com:35993/investment-simulator';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
    'mongodb://admin:drummer1@ds237989.mlab.com:37989/investment-simulator-test';
exports.PORT = process.env.PORT || 8080;

//CALEB - move to REACT app?
module.exports = {
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};


//CALEB - add to correct component in react app for search results/update API_BASE_URL

//componentDidMount() {
//    this.loadBoard();
//}
//
//loadBoard() {
//    this.setState({
//        error: null,
//        loading: true
//    });
//    return fetch(`${API_BASE_URL}/board`)
//        .then(res => {
//        if (!res.ok) {
//            return Promise.reject(res.statusText);
//        }
//        return res.json();
//    })
//        .then(board =>
//              this.setState({
//        lists: board.lists,
//        loading: false
//    })
//             )
//        .catch(err =>
//               this.setState({
//        error: 'Could not load board',
//        loading: false
//    })
//              );
//}
