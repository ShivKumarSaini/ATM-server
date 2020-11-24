class ConstantDataService {

    static allBills() {
        return {
            "2000": 5,
            "500": 7,
            "200": 2,
            "100": 4
        };
    }

    static allColors() {
        return ['red', 'green', 'yellow', 'green', 'red', 'red', 'green', 'red', 'green', 'blue', 'yellow', 'green', 'green', 'red', 'green', 'blue'];
    }
}

module.exports = ConstantDataService;
