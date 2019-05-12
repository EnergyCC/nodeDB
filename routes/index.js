const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = require('../db');
const jwt = require('jsonwebtoken');
const checkAuthentication = require('./authentication');

//database connection

connection.db.connect(err => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connection successfully made');
    }
});

//create router for index

router.get('/', checkAuthentication, (req, res) => {
    let sql = `SELECT * FROM profile LIMIT 10;`;
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            connection.db.query(sql, (err, results) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(403);
                } else {
                    res.render('results', {
                        results
                    });
                }
            });
        }
    });
});

// Search function ↓
router.post('/', checkAuthentication, (req, res) => {
    let { searchQuery, searchParam } = req.body;
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            console.log(`Param: ${searchParam} || Query: ${searchQuery}`);
            let sql = `SELECT * FROM profile WHERE ${searchParam} LIKE '%${searchQuery}%'`;
            connection.db.query(sql, (err, results) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(403);
                } else {
                    res.render('results', {
                        results
                    });
                }
            });
        }
    });
});

//router get for the add form
router.get('/add', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let url = '/index/add';
            let mth = 'POST';
            res.render('add', {
                url,
                mth
            });
        }
    });
});

// router post for the data post
router.post('/add', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let { nume, model_masina, nr_inmatriculare, cost } = req.body;
            let sql =
                'INSERT INTO profile(nume, model_masina, nr_inmatriculare, data_adaug, cost) VALUES (?, ?, ?, ?, ?);';
            let d = new Date();
            const data =
                d.getFullYear() + '-' + parseInt(d.getMonth() + 1) + '-' + d.getDate();
            let errors = [];

            // field validation
            if (!nume) {
                errors.push({ text: 'Please add a name' });
            }
            if (!model_masina) {
                errors.push({ text: 'Please add a car model' });
            }
            if (!nr_inmatriculare) {
                errors.push({ text: 'Please add a plate number' });
            }
            if (!cost) {
                errors.push({ text: 'Please add a cost' });
            }

            if (errors.length > 0) {
                let url = '/index/add';
                let mth = 'POST';
                res.render('add', {
                    url,
                    mth,
                    errors,
                    nume,
                    model_masina,
                    nr_inmatriculare,
                    cost
                });
            } else {
                connection.db.query(
                    sql, [
                        nume.toUpperCase(),
                        model_masina.toUpperCase(),
                        nr_inmatriculare.toUpperCase(),
                        data,
                        cost
                    ],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(data);
                            res.redirect('/index');
                        }
                    }
                );
            }
        }
    });
});

//Just raw(dog) data
router.get('/getdb', checkAuthentication, (req, res) => {
    let sql = 'SELECT * FROM profile;';
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            connection.db.query(sql, (err, results) => {
                res.send(results);
            });
        }
    });
});

// get and render delete route
router.get('/delete/:id', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let sql = 'SELECT * FROM profile WHERE profile_id = ?;';
            connection.db.query(sql, req.params.id, (err, result) => {
                if (err) throw err;
                else {
                    let nume = result[0].nume;
                    let profile_id = result[0].profile_id;
                    res.render('remove', {
                        nume,
                        profile_id
                    });
                }
            });
        }
    });
});

//confirm deletion route
router.get('/delete/:id/true', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let sql = 'DELETE FROM profile WHERE profile_id = ?;';
            connection.db.query(sql, req.params.id, (err, result) => {
                if (err) throw err;
                else {
                    res.redirect('/index');
                }
            });
        }
    });
});

//Add edit route with data -> send it to app.handlebars
router.get('/edit/:id', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let sql = 'SELECT * FROM profile WHERE profile_id = ?;';
            connection.db.query(sql, req.params.id, (err, result) => {
                let url = `/index/edit/${req.params.id}`;
                let mth = 'POST';
                let nume = result[0].nume;
                let model_masina = result[0].model_masina;
                let nr_inmatriculare = result[0].nr_inmatriculare;
                let cost = result[0].cost;
                // console.log(req.params.id);
                if (err) console.log(err);
                else {
                    // console.log(result);
                    res.render('add', {
                        url,
                        mth,
                        nume,
                        model_masina,
                        nr_inmatriculare,
                        cost
                    });
                }
            });
        }
    });
});

//Edit route for editing purpose onyl

router.post('/edit/:id', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let sql =
                'UPDATE profile SET nume=?, model_masina=?, nr_inmatriculare=?, cost=? WHERE profile_id=?';
            let { nume, model_masina, nr_inmatriculare, cost } = req.body;
            connection.db.query(
                sql, [nume, model_masina, nr_inmatriculare, cost, req.params.id],
                (err, result) => {
                    if (err) console.log(err);
                    else {
                        // console.log(req.body);
                        res.redirect('/index');
                    }
                }
            );
        }
    });
});

// create view route for jobs table

router.get('/view/:id', (req, res) => {
    let sql = 'SELECT * FROM profile WHERE profile_id = ?';
    let profile_id = req.params.id;
    connection.db.query(sql, profile_id, (err, result) => {
        if (err) {
            console.log(err.message);
            res.sendStatus(403);
        } else {
            let nume = result[0].nume;
            let model_masina = result[0].model_masina;
            let nr_inmatriculare = result[0].nr_inmatriculare;
            let cost = result[0].cost;
            let data_N = result[0].data_adaug.toLocaleDateString('en-GB').split('/');
            let data_adaug = `${data_N[1]}/${data_N[0]}/${data_N[2]}`;
            let jsql = `SELECT * FROM jobs WHERE nume =?`;
            connection.db.query(jsql, nume, (err, results) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(403);
                } else {
                    // console.log(results);
                    console.log(`From view ${nume} || ${result[0].nume}`)
                    res.render('view', {
                        results,
                        profile_id,
                        nume,
                        model_masina,
                        nr_inmatriculare,
                        cost,
                        data_adaug
                    });
                }
            });
        }
    });
});

// route to render the form for adding jobs

router.get('/view/:id/addjobs', (req, res) => {
    let nume = req.query.nume;
    let profile_id = req.params.id;
    let url = `/index/view/${profile_id}/addjobs?nume=${nume}`;
    let mth = 'POST';
    console.log(`from addjobs ${nume} || ${profile_id}`);
    res.render('addjobs', {
        url,
        mth,
        profile_id
    });
});

// post route to add the job data

router.post('/view/:id/addjobs', (req, res) => {
    let nume = req.query.nume;
    let profile_id = req.params.id;
    let { rep_cost, descript, partRepl } = req.body;
    console.log(nume);
    let sql =
        'INSERT INTO jobs(rep_cost, descript, partRepl, nume, profile_id) VALUES(?, ?, ?, ?, ?)';

    connection.db.query(
        sql, [rep_cost, descript, partRepl, nume, profile_id],
        (err, result) => {
            if (err) {
                console.log(err);
                res.sendStatus(403);
            } else {
                res.redirect(`/index/view/${profile_id}`);
            }
        }
    );
});


// route to confirm job remove
router.get('/deletejobs/:id', (req, res) => {
    let profile_id = req.query.profile;
    let jobID = req.params.id;
    res.render('removejobs', {
        jobID,
        profile_id
    })
});

// route to remove jobs

router.get('/deletejobs/:id/true', (req, res) => {
    let profile_id = req.query.profile;
    let jobID = req.params.id;
    let sql = 'DELETE FROM jobs WHERE jobID = ?';
    console.log(`${profile_id} | ${jobID} | ${sql}`);
    connection.db.query(sql, jobID, (err, result) => {
        if (err) {
            console.log(err);
            res.send(403);
        } else {
            res.redirect(`/index/view/${profile_id}`);
            console.log(`Successfully removed job with the id ${jobID}`)
        }
    })
});

module.exports = router;