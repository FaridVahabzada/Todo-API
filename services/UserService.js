class UserService {
    constructor(db) {
        this.client = db.sequelize;
        this.User = db.User;
    };

    async getOne(email) {
        return this.User.findOne({
            where: {email: email}
        }).catch(function (err) {
            console.log(err);
        });
    };
    
    async getAll() {
        return this.User.findAll({
            where: {}
        }).catch(function (err) {
            console.log(err);
        });
    };

    async create(name, email, encryptedPassword, salt) {
        return this.User.create(
            {
                name: name,
                email: email,
                encryptedPassword: encryptedPassword,
                salt: salt
            }
        ).catch(function (err) {
            console.log(err);
        });
    };

    async delete(email) {
        return this.User.destroy({
            where: {
                email: email
            }
        }).catch(function (err) {
            console.log(err);
        });
    };
};

module.exports = UserService;