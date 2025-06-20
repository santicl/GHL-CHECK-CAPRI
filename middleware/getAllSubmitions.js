const axios = require("axios");

// Función reutilizable para obtener submissions paginados
const getSubmissions = async (formId, limit = 100) => {
    let page = 1;
    let allSubmissions = [];
    let hasMore = true;

    while (hasMore) {
        const url = `https://rest.gohighlevel.com/v1/forms/submissions?page=${page}&limit=${limit}&formId=${formId}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${process.env.API_KEY_CAPRI}`,
                    'Content-Type': 'application/json'
                }
            });

            const submissions = response.data.submissions || [];

            allSubmissions = allSubmissions.concat(submissions);

            if (submissions.length < limit) {
                hasMore = false;
            } else {
                page++;
            }

        } catch (error) {
            console.error(`Error obteniendo submissions del formId ${formId} página ${page}:`, error.message);
            throw error;
        }
    }

    return allSubmissions;
};

const getFormAllByIdSubmissions = async (req, res, next) => {
    const formId = process.env.FORM_ID;
    const formSecondId = process.env.FORM_SECOND_ID;
    const limit = 100;

    if (!formId || !formSecondId) {
        return res.status(400).json({ error: 'FORM_ID y FORM_SECOND_ID son requeridos en las variables de entorno' });
    }

    try {
        // Obtener todos los submissions de ambos formularios
        const [form1Submissions, form2Submissions] = await Promise.all([
            getSubmissions(formId, limit),
            getSubmissions(formSecondId, limit)
        ]);

        // Combinar todas las submissions
        req.body.submissions = [...form1Submissions, ...form2Submissions];
        next();

    } catch (error) {
        console.error('Error al obtener los datos de los formularios:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Error al obtener los datos',
            details: error.response?.data || error.message
        });
    }
};

module.exports = getFormAllByIdSubmissions;
