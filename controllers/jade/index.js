/*
 * jade
 */
exports.index = function(req, res) {
    res.render('jade/index', {
        hello: '这是mockdata数据。。。'
    });
};
