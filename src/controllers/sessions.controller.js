const DaoFactory = require('../DAO/daoFactory');
const userDao = DaoFactory.getUserDao();
const UserDTO = require('../DTOS/user.dto');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userDao.findByEmail(email);
        
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        req.session.user = new UserDTO(user);

        res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.logout = async (req, res) => {
    try {
        delete req.session.user;
        
        res.status(200).json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.currentSession = async (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'No hay sesión activa' });
    }
};
