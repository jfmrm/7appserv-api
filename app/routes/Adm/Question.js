import { Question } from '../../models';
import { Router } from 'express';

let router = Router();

router.post('/', (req, res) => {
    let question = req.body.question;
    let type = req.body.type;
    let fields = req.body.fields;

    if(!question || !type || !fields) {
        res.status(400).json({ message: 'missing paramenters' })
    } else {
        new Question(question, type, null, fields).create()
            .then((question) => {
                res.status(201).json(question)
            }).catch((error) => {
                res.status(500).json(error)
            })
    }
});

router.get('/:questionId', (req, res) => {
    let questionId = req.params.questionId;

    new Question().get('id', questionId)
        .then((question) => {
            res.status(200).json(question)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

router.get('/', (req, res) => {
    Question.listQuestions()
        .then((questions) => {
            res.status(200).json(questions)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

export const QuestionsRouter = router;