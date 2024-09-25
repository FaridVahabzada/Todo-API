class CategoryService {
    constructor(db) {
        this.client = db.sequelize;
        this.Category = db.Category;
    }

    async create(name, userid) {
        return this.Category.create(
            {
                name: name,
                UserId: userid
            }
        ).catch(function (err) {
            console.log(err);
        });
    }
    
    async getOne(categoryid, userid) {
        return this.Category.findOne({
            where: {
                id: categoryid,
                UserId: userid
            }
        }).catch(function (err) {
            console.log(err);
        });
    };

    async getOneByName(categoryname, userid) {
        return this.Category.findOne({
            where: {
                name: categoryname,
                UserId: userid
            }
        }).catch(function (err) {
            console.log(err);
        });
    };

    async getAll(userid) {
        return this.Category.findAll({
            where: {UserId: userid,}
        }).catch(function (err) {
            console.log(err);
        });
    };

    async updateCategory(categoryid, name, userid) {
        return this.Category.update(
        {
            name: name
        },
        {
            where: {
                id: categoryid,
                UserId: userid
            }
        }).catch(function (err) {
            console.log(err);
        });
    };
    
    async deleteCategory(categoryid, userid) {
        return this.Category.destroy({
            where: {
                id: categoryid,
                UserId: userid
            }
        }).catch(function (err) {
            console.log(err);
        });
    };
}

module.exports = CategoryService;