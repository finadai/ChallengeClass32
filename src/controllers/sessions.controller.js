const DaoFactory = require('../DAO/daoFactory');
const userDao = DaoFactory.getUserDao();
const UserDTO = require('../DTOS/user.dto');
const errorCodes = require('../utils/errorCodes');

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await userDao.findByEmail(email);
        
        if (!user || !(await user.comparePassword(password))) {
            const error = new Error('Invalid credentials');
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        req.session.user = new UserDTO(user);

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        delete req.session.user;
        
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        next(error);
    }
};

exports.currentSession = async (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'No active session' });
    }
};
