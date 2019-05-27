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

//temporary route to create profile and jobs tables

router.get('/createtables', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let sqlP =
                'CREATE TABLE IF NOT EXISTS profile(profile_id INT PRIMARY KEY AUTO_INCREMENT, nume_client VARCHAR(64), tip_auto VARCHAR(48), nr_inmatriculare VARCHAR(15), serie_caroserie VARCHAR(20), serie_motor VARCHAR(20))';
            let sqlJ =
                'CREATE TABLE IF NOT EXISTS jobs(job_id INT PRIMARY KEY AUTO_INCREMENT, data_adaugare DATE, lucrari_sol VARCHAR(512), den_piesa_cl VARCHAR(255), buc_piesa_cl VARCHAR(24), def_suplim VARCHAR(255), termen_executie VARCHAR(12), denum_operatie VARCHAR(512), timp_operatie VARCHAR(24), tarif_ora INT, denum_piesa VARCHAR(255), cant_piese VARCHAR(24), pret_piesa VARCHAR(24), profile_id INT, kilometri INT, FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON UPDATE CASCADE ON DELETE CASCADE)';
            connection.db.query(sqlP, (err, results) => {
                if (err) console.log(err);
                else {
                    connection.db.query(sqlJ, (err, result) => {
                        if (err) console.log(err);
                        else {
                            console.log('successful');
                        }
                    });
                }
            });
        }
    });
});

//create router for index

router.get('/', checkAuthentication, (req, res) => {
    let sql = `SELECT * FROM profile LIMIT 50;`;
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            connection.db.query(sql, (err, results) => {
                if (err) {
                    console.log(err);
                    let error = 'Eroare';
                    res.render('errors', {
                        error
                    });
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
            let sql = `SELECT * FROM profile WHERE ${searchParam} LIKE '%${searchQuery}%'`;
            connection.db.query(sql, (err, results) => {
                if (err) {
                    res.render('errors', {
                        error
                    });
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

// router post for the data post, always 5 data entries for profiles
router.post('/add', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let {
                nume_client,
                tip_auto,
                nr_inmatriculare,
                serie_caroserie,
                serie_motor
            } = req.body;
            let sql =
                'INSERT INTO profile(nume_client, tip_auto, nr_inmatriculare, serie_caroserie, serie_motor) VALUES (?, ?, ?, ?, ?);';
            //   let d = new Date();
            //   const data =
            //     d.getFullYear() + '-' + parseInt(d.getMonth() + 1) + '-' + d.getDate();
            let errors = [];

            // field validation
            if (!nume_client) {
                errors.push({ text: 'Nu ai introdus un nume client' });
            }
            if (!tip_auto) {
                errors.push({ text: 'Nu ai introdus un tip auto' });
            }
            if (!nr_inmatriculare) {
                errors.push({ text: 'Nu ai introdus un numar de inmatriculare' });
            }
            if (!serie_caroserie) {
                errors.push({ text: 'Nu ai introdus o serie de caroserie' });
            }
            if (!serie_motor) {
                errors.push({ text: 'Nu ai introdus o serie de motor' });
            }

            if (errors.length > 0) {
                let url = '/index/add';
                let mth = 'POST';
                res.render('add', {
                    url,
                    mth,
                    errors,
                    nume_client,
                    tip_auto,
                    nr_inmatriculare,
                    serie_caroserie,
                    serie_motor
                });
            } else {
                connection.db.query(
                    sql, [
                        nume_client.toUpperCase(),
                        tip_auto.toUpperCase(),
                        nr_inmatriculare.toUpperCase(),
                        serie_caroserie.toUpperCase(),
                        serie_motor.toUpperCase()
                    ],
                    (err, result) => {
                        if (err) {
                            let error = 'Eroare';
                            console.log(err);
                            res.render('errors', {
                                error
                            });
                        } else {
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
    let sql = 'SELECT * FROM profile LIMIT 50';
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
                    let nume_client = result[0].nume_client;
                    let profile_id = result[0].profile_id;
                    res.render('remove', {
                        nume_client,
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
                let nume_client = result[0].nume_client;
                let tip_auto = result[0].tip_auto;
                let nr_inmatriculare = result[0].nr_inmatriculare;
                let serie_caroserie = result[0].serie_caroserie;
                let serie_motor = result[0].serie_motor;
                if (err) console.log(err);
                else {
                    res.render('add', {
                        url,
                        mth,
                        nume_client,
                        tip_auto,
                        nr_inmatriculare,
                        serie_caroserie,
                        serie_motor
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
                'UPDATE profile SET nume_client=?, tip_auto=?, nr_inmatriculare=?, serie_caroserie=?, serie_motor=? WHERE profile_id=?';
            let {
                nume_client,
                tip_auto,
                nr_inmatriculare,
                serie_caroserie,
                serie_motor
            } = req.body;
            connection.db.query(
                sql, [
                    nume_client.toUpperCase(),
                    tip_auto.toUpperCase(),
                    nr_inmatriculare.toUpperCase(),
                    serie_caroserie.toUpperCase(),
                    serie_motor.toUpperCase(),
                    req.params.id
                ],
                (err, result) => {
                    if (err) console.log(err);
                    else {
                        res.redirect('/index');
                    }
                }
            );
        }
    });
});

// create view route for jobs table

router.get('/view/:id', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let sql = 'SELECT * FROM profile WHERE profile_id = ?';
            let profile_id = req.params.id;
            connection.db.query(sql, profile_id, (err, result) => {
                if (err) {
                    console.log(err.message);
                    let error = 'Eroare';
                    res.render('errors', {
                        error
                    });
                } else {
                    let nume_client = result[0].nume_client;
                    let tip_auto = result[0].tip_auto;
                    let nr_inmatriculare = result[0].nr_inmatriculare;
                    let serie_caroserie = result[0].serie_caroserie;
                    //   let data_N = result[0].data_adaug.toLocaleDateString('en-GB').split('/');
                    //   let data_adaug = `${data_N[1]}/${data_N[0]}/${data_N[2]}`;
                    let serie_motor = result[0].serie_motor;
                    let jsql = `SELECT * FROM jobs WHERE profile_id =?`;
                    connection.db.query(jsql, profile_id, (err, results) => {
                        if (err) {
                            console.log(err);
                            let error = 'Eroare'; //Errors string temp
                            res.render('errors', {
                                error
                            });
                        } else {
                            res.render('view', {
                                results,
                                profile_id,
                                nume_client,
                                tip_auto,
                                nr_inmatriculare,
                                serie_caroserie,
                                serie_motor
                            });
                        }
                    });
                }
            });
        }
    });
});

// route to render the form for adding jobs

router.get('/view/:id/addjobs', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let profile_id = req.params.id;
            let url = `/index/view/${profile_id}/addjobs`;
            let mth = 'POST';
            res.render('addjobs', {
                url,
                mth,
                profile_id
            });
        }
    });
});

// post route to add the job data

router.post('/view/:id/addjobs', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let lucrari_sol_parse = [
                req.body.lucrari_sol1,
                req.body.lucrari_sol2,
                req.body.lucrari_sol3,
                req.body.lucrari_sol4,
                req.body.lucrari_sol5
            ];
            let den_piesa_cl_parse = [
                req.body.den_piesa_cl1,
                req.body.den_piesa_cl2,
                req.body.den_piesa_cl3,
                req.body.den_piesa_cl4,
                req.body.den_piesa_cl5
            ];
            let buc_piesa_cl_parse = [
                req.body.buc_piesa_cl1,
                req.body.buc_piesa_cl2,
                req.body.buc_piesa_cl3,
                req.body.buc_piesa_cl4,
                req.body.buc_piesa_cl5
            ];
            let def_suplim_parse = [
                req.body.def_suplimentare1,
                req.body.def_suplimentare2
            ];
            let termen_executie = req.body.termen_executie;
            let denum_operatie_parse = [
                req.body.denum_operatie1,
                req.body.denum_operatie2,
                req.body.denum_operatie3,
                req.body.denum_operatie4,
                req.body.denum_operatie5
            ];
            let kilometri = parseInt(req.body.kilometri);
            let timp_operatie_parse = [
                req.body.timp_operatie1,
                req.body.timp_operatie2,
                req.body.timp_operatie3,
                req.body.timp_operatie4,
                req.body.timp_operatie5
            ];
            let denum_piesa_parse = [
                req.body.denum_piesa1,
                req.body.denum_piesa2,
                req.body.denum_piesa3,
                req.body.denum_piesa4,
                req.body.denum_piesa5
            ];
            let cant_piese_parse = [
                req.body.cant_piese1,
                req.body.cant_piese2,
                req.body.cant_piese3,
                req.body.cant_piese4,
                req.body.cant_piese5
            ];
            let pret_piesa_parse = [
                req.body.pret_piesa1,
                req.body.pret_piesa2,
                req.body.pret_piesa3,
                req.body.pret_piesa4,
                req.body.pret_piesa5
            ];
            let tarif_ora = req.body.tarif_ora;
            let lucrari_sol = JSON.stringify(lucrari_sol_parse);
            let den_piesa_cl = JSON.stringify(den_piesa_cl_parse);
            let buc_piesa_cl = JSON.stringify(buc_piesa_cl_parse);
            let def_suplim = JSON.stringify(def_suplim_parse);
            let denum_operatie = JSON.stringify(denum_operatie_parse);
            let timp_operatie = JSON.stringify(timp_operatie_parse);
            let denum_piesa = JSON.stringify(denum_piesa_parse);
            let cant_piese = JSON.stringify(cant_piese_parse);
            let pret_piesa = JSON.stringify(pret_piesa_parse);
            let profile_id = req.params.id;
            let d = new Date();
            console.log(lucrari_sol);
            const data =
                d.getFullYear() + '-' + parseInt(d.getMonth() + 1) + '-' + d.getDate();
            let sql =
                'INSERT INTO jobs(data_adaugare, lucrari_sol, den_piesa_cl, buc_piesa_cl, def_suplim, termen_executie, denum_operatie, timp_operatie, tarif_ora, denum_piesa, cant_piese, pret_piesa, profile_id, kilometri) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            connection.db.query(
                sql, [
                    data,
                    lucrari_sol,
                    den_piesa_cl,
                    buc_piesa_cl,
                    def_suplim,
                    termen_executie,
                    denum_operatie,
                    timp_operatie,
                    tarif_ora,
                    denum_piesa,
                    cant_piese,
                    pret_piesa,
                    profile_id,
                    kilometri
                ],
                (err, result) => {
                    if (err) {
                        console.log(err);
                        let error = 'Eroare';
                        res.render('errors', {
                            error
                        });
                    } else {
                        res.redirect(`/index/view/${profile_id}`);
                    }
                }
            );
        }
    });
});

// route to confirm job remove
router.get('/deletejobs/:id', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let profile_id = req.query.profile;
            let operatie = req.query.nume;
            let job_id = req.params.id;
            res.render('removejobs', {
                job_id,
                profile_id,
                operatie
            });
        }
    });
});

// route to remove jobs

router.get('/deletejobs/:id/true', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let profile_id = req.query.profile;
            let job_id = req.params.id;
            let sql = 'DELETE FROM jobs WHERE job_id = ?';
            // console.log(`${profile_id} | ${jobID} | ${sql}`);
            connection.db.query(sql, job_id, (err, result) => {
                if (err) {
                    console.log(err);
                    let error = 'Eroare';
                    res.render('errors', {
                        error
                    });
                } else {
                    res.redirect(`/index/view/${profile_id}`);
                    console.log(`Successfully removed job with the id ${job_id}`);
                }
            });
        }
    });
});

//route to render edit jobs

router.get('/editjobs/:id', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let job_id = req.params.id;
            let profile_id = req.query.profile;
            console.log(profile_id);
            let sql = 'SELECT * FROM jobs WHERE job_id = ?';
            connection.db.query(sql, job_id, (err, result) => {
                let url = `${job_id}?profile=${profile_id}`;
                let mth = `POST`;
                let lucrari_sol1 = JSON.parse(result[0].lucrari_sol)[0];
                let lucrari_sol2 = JSON.parse(result[0].lucrari_sol)[1];
                let lucrari_sol3 = JSON.parse(result[0].lucrari_sol)[2];
                let lucrari_sol4 = JSON.parse(result[0].lucrari_sol)[3];
                let lucrari_sol5 = JSON.parse(result[0].lucrari_sol)[4];
                let den_piesa_cl1 = JSON.parse(result[0].den_piesa_cl)[0];
                let den_piesa_cl2 = JSON.parse(result[0].den_piesa_cl)[1];
                let den_piesa_cl3 = JSON.parse(result[0].den_piesa_cl)[2];
                let den_piesa_cl4 = JSON.parse(result[0].den_piesa_cl)[3];
                let den_piesa_cl5 = JSON.parse(result[0].den_piesa_cl)[4];
                let buc_piesa_cl1 = JSON.parse(result[0].buc_piesa_cl)[0];
                let buc_piesa_cl2 = JSON.parse(result[0].buc_piesa_cl)[1];
                let buc_piesa_cl3 = JSON.parse(result[0].buc_piesa_cl)[2];
                let buc_piesa_cl4 = JSON.parse(result[0].buc_piesa_cl)[3];
                let buc_piesa_cl5 = JSON.parse(result[0].buc_piesa_cl)[4];
                let def_suplimentare1 = JSON.parse(result[0].def_suplim)[0];
                let def_suplimentare2 = JSON.parse(result[0].def_suplim)[1];
                let termen_executie = result[0].termen_executie;
                let denum_operatie1 = JSON.parse(result[0].denum_operatie)[0];
                let denum_operatie2 = JSON.parse(result[0].denum_operatie)[1];
                let denum_operatie3 = JSON.parse(result[0].denum_operatie)[2];
                let denum_operatie4 = JSON.parse(result[0].denum_operatie)[3];
                let denum_operatie5 = JSON.parse(result[0].denum_operatie)[4];
                let kilometri = result[0].kilometri;
                let timp_operatie1 = JSON.parse(result[0].timp_operatie)[0];
                let timp_operatie2 = JSON.parse(result[0].timp_operatie)[1];
                let timp_operatie3 = JSON.parse(result[0].timp_operatie)[2];
                let timp_operatie4 = JSON.parse(result[0].timp_operatie)[3];
                let timp_operatie5 = JSON.parse(result[0].timp_operatie)[4];
                let denum_piesa1 = JSON.parse(result[0].denum_piesa)[0];
                let denum_piesa2 = JSON.parse(result[0].denum_piesa)[1];
                let denum_piesa3 = JSON.parse(result[0].denum_piesa)[2];
                let denum_piesa4 = JSON.parse(result[0].denum_piesa)[3];
                let denum_piesa5 = JSON.parse(result[0].denum_piesa)[4];
                let cant_piese1 = JSON.parse(result[0].cant_piese)[0];
                let cant_piese2 = JSON.parse(result[0].cant_piese)[1];
                let cant_piese3 = JSON.parse(result[0].cant_piese)[2];
                let cant_piese4 = JSON.parse(result[0].cant_piese)[3];
                let cant_piese5 = JSON.parse(result[0].cant_piese)[4];
                let pret_piesa1 = JSON.parse(result[0].pret_piesa)[0];
                let pret_piesa2 = JSON.parse(result[0].pret_piesa)[1];
                let pret_piesa3 = JSON.parse(result[0].pret_piesa)[2];
                let pret_piesa4 = JSON.parse(result[0].pret_piesa)[3];
                let pret_piesa5 = JSON.parse(result[0].pret_piesa)[4];

                console.log(lucrari_sol5);
                res.render('addjobs', {
                    url,
                    mth,
                    lucrari_sol1,
                    lucrari_sol2,
                    lucrari_sol3,
                    lucrari_sol4,
                    lucrari_sol5,
                    den_piesa_cl1,
                    den_piesa_cl2,
                    den_piesa_cl3,
                    den_piesa_cl4,
                    den_piesa_cl5,
                    buc_piesa_cl1,
                    buc_piesa_cl2,
                    buc_piesa_cl3,
                    buc_piesa_cl4,
                    buc_piesa_cl5,
                    def_suplimentare1,
                    def_suplimentare2,
                    termen_executie,
                    denum_operatie1,
                    denum_operatie2,
                    denum_operatie3,
                    denum_operatie4,
                    denum_operatie4,
                    denum_operatie5,
                    kilometri,
                    timp_operatie1,
                    timp_operatie2,
                    timp_operatie3,
                    timp_operatie4,
                    timp_operatie5,
                    denum_piesa1,
                    denum_piesa2,
                    denum_piesa3,
                    denum_piesa4,
                    denum_piesa5,
                    cant_piese1,
                    cant_piese2,
                    cant_piese3,
                    cant_piese4,
                    cant_piese5,
                    pret_piesa1,
                    pret_piesa2,
                    pret_piesa3,
                    pret_piesa4,
                    pret_piesa5
                });
            });
        }
    });
});

// router for edit

router.post('/editjobs/:id', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let profile_id = req.query.profile;
            let src = req.query.source;
            let lucrari_sol_parse = [
                req.body.lucrari_sol1,
                req.body.lucrari_sol2,
                req.body.lucrari_sol3,
                req.body.lucrari_sol4,
                req.body.lucrari_sol5
            ];
            let den_piesa_cl_parse = [
                req.body.den_piesa_cl1,
                req.body.den_piesa_cl2,
                req.body.den_piesa_cl3,
                req.body.den_piesa_cl4,
                req.body.den_piesa_cl5
            ];
            let buc_piesa_cl_parse = [
                req.body.buc_piesa_cl1,
                req.body.buc_piesa_cl2,
                req.body.buc_piesa_cl3,
                req.body.buc_piesa_cl4,
                req.body.buc_piesa_cl5
            ];
            let def_suplim_parse = [
                req.body.def_suplimentare1,
                req.body.def_suplimentare2
            ];
            let termen_executie = req.body.termen_executie;
            let denum_operatie_parse = [
                req.body.denum_operatie1,
                req.body.denum_operatie2,
                req.body.denum_operatie3,
                req.body.denum_operatie4,
                req.body.denum_operatie5
            ];
            let kilometri = parseInt(req.body.kilometri);
            let timp_operatie_parse = [
                req.body.timp_operatie1,
                req.body.timp_operatie2,
                req.body.timp_operatie3,
                req.body.timp_operatie4,
                req.body.timp_operatie5
            ];
            let denum_piesa_parse = [
                req.body.denum_piesa1,
                req.body.denum_piesa2,
                req.body.denum_piesa3,
                req.body.denum_piesa4,
                req.body.denum_piesa5
            ];
            let cant_piese_parse = [
                req.body.cant_piese1,
                req.body.cant_piese2,
                req.body.cant_piese3,
                req.body.cant_piese4,
                req.body.cant_piese5
            ];
            let pret_piesa_parse = [
                req.body.pret_piesa1,
                req.body.pret_piesa2,
                req.body.pret_piesa3,
                req.body.pret_piesa4,
                req.body.pret_piesa5
            ];
            let tarif_ora = req.body.tarif_ora;
            let lucrari_sol = JSON.stringify(lucrari_sol_parse);
            let den_piesa_cl = JSON.stringify(den_piesa_cl_parse);
            let buc_piesa_cl = JSON.stringify(buc_piesa_cl_parse);
            let def_suplim = JSON.stringify(def_suplim_parse);
            let denum_operatie = JSON.stringify(denum_operatie_parse);
            let timp_operatie = JSON.stringify(timp_operatie_parse);
            let denum_piesa = JSON.stringify(denum_piesa_parse);
            let cant_piese = JSON.stringify(cant_piese_parse);
            let pret_piesa = JSON.stringify(pret_piesa_parse);
            let job_id = req.params.id;
            let sql = 'UPDATE jobs set lucrari_sol = ?, den_piesa_cl = ?, buc_piesa_cl = ?, def_suplim = ?, termen_executie = ?, denum_operatie = ?, timp_operatie = ?, tarif_ora = ?, denum_piesa = ?, cant_piese = ?, pret_piesa = ?, kilometri = ? where job_id = ?';

            connection.db.query(sql, [lucrari_sol, den_piesa_cl, buc_piesa_cl, def_suplim, termen_executie, denum_operatie, timp_operatie, tarif_ora, denum_piesa, cant_piese, pret_piesa, kilometri, job_id], (err, result) => {
                if (err) {
                    console.log(err);
                    let error = 'Eroare';
                    res.render('errors', {
                        error
                    })
                } else {
                    console.log(src, profile_id);
                    if (src == 'view') {
                        res.redirect(`/index/view/${profile_id}`);
                    }
                    if (src == 'jobs') {
                        res.redirect(`/index/viewjobs/${job_id}`);
                    }
                }
            })
        }
    })
})

router.get('/viewjobs/:id', checkAuthentication, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect('/login');
        } else {
            let sql = 'SELECT * FROM jobs WHERE job_id = ?';
            let job_id = req.params.id;
            let profile_id = req.query.profile;
            connection.db.query(sql, job_id, (err, result) => {
                if (err) {
                    console.log(err);
                    let error = 'Eroare';
                    res.render('errors', {
                        error
                    })
                } else {
                    let job_id = result[0].job_id;
                    let lucrari_sol1 = JSON.parse(result[0].lucrari_sol)[0];
                    let lucrari_sol2 = JSON.parse(result[0].lucrari_sol)[1];
                    let lucrari_sol3 = JSON.parse(result[0].lucrari_sol)[2];
                    let lucrari_sol4 = JSON.parse(result[0].lucrari_sol)[3];
                    let lucrari_sol5 = JSON.parse(result[0].lucrari_sol)[4];
                    let den_piesa_cl1 = JSON.parse(result[0].den_piesa_cl)[0];
                    let den_piesa_cl2 = JSON.parse(result[0].den_piesa_cl)[1];
                    let den_piesa_cl3 = JSON.parse(result[0].den_piesa_cl)[2];
                    let den_piesa_cl4 = JSON.parse(result[0].den_piesa_cl)[3];
                    let den_piesa_cl5 = JSON.parse(result[0].den_piesa_cl)[4];
                    let buc_piesa_cl1 = JSON.parse(result[0].buc_piesa_cl)[0];
                    let buc_piesa_cl2 = JSON.parse(result[0].buc_piesa_cl)[1];
                    let buc_piesa_cl3 = JSON.parse(result[0].buc_piesa_cl)[2];
                    let buc_piesa_cl4 = JSON.parse(result[0].buc_piesa_cl)[3];
                    let buc_piesa_cl5 = JSON.parse(result[0].buc_piesa_cl)[4];
                    let def_suplimentare1 = JSON.parse(result[0].def_suplim)[0];
                    let def_suplimentare2 = JSON.parse(result[0].def_suplim)[1];
                    let termen_executie = result[0].termen_executie;
                    let denum_operatie1 = JSON.parse(result[0].denum_operatie)[0];
                    let denum_operatie2 = JSON.parse(result[0].denum_operatie)[1];
                    let denum_operatie3 = JSON.parse(result[0].denum_operatie)[2];
                    let denum_operatie4 = JSON.parse(result[0].denum_operatie)[3];
                    let denum_operatie5 = JSON.parse(result[0].denum_operatie)[4];
                    let kilometri = result[0].kilometri;
                    let timp_operatie1 = JSON.parse(result[0].timp_operatie)[0];
                    let timp_operatie2 = JSON.parse(result[0].timp_operatie)[1];
                    let timp_operatie3 = JSON.parse(result[0].timp_operatie)[2];
                    let timp_operatie4 = JSON.parse(result[0].timp_operatie)[3];
                    let timp_operatie5 = JSON.parse(result[0].timp_operatie)[4];
                    let denum_piesa1 = JSON.parse(result[0].denum_piesa)[0];
                    let denum_piesa2 = JSON.parse(result[0].denum_piesa)[1];
                    let denum_piesa3 = JSON.parse(result[0].denum_piesa)[2];
                    let denum_piesa4 = JSON.parse(result[0].denum_piesa)[3];
                    let denum_piesa5 = JSON.parse(result[0].denum_piesa)[4];
                    let cant_piese1 = JSON.parse(result[0].cant_piese)[0];
                    let cant_piese2 = JSON.parse(result[0].cant_piese)[1];
                    let cant_piese3 = JSON.parse(result[0].cant_piese)[2];
                    let cant_piese4 = JSON.parse(result[0].cant_piese)[3];
                    let cant_piese5 = JSON.parse(result[0].cant_piese)[4];
                    let pret_piesa1 = JSON.parse(result[0].pret_piesa)[0];
                    let pret_piesa2 = JSON.parse(result[0].pret_piesa)[1];
                    let pret_piesa3 = JSON.parse(result[0].pret_piesa)[2];
                    let pret_piesa4 = JSON.parse(result[0].pret_piesa)[3];
                    let pret_piesa5 = JSON.parse(result[0].pret_piesa)[4];
                    res.render('viewjobs', {
                        profile_id,
                        job_id,
                        lucrari_sol1,
                        lucrari_sol2,
                        lucrari_sol3,
                        lucrari_sol4,
                        lucrari_sol5,
                        den_piesa_cl1,
                        den_piesa_cl2,
                        den_piesa_cl3,
                        den_piesa_cl4,
                        den_piesa_cl5,
                        buc_piesa_cl1,
                        buc_piesa_cl2,
                        buc_piesa_cl3,
                        buc_piesa_cl4,
                        buc_piesa_cl5,
                        def_suplimentare1,
                        def_suplimentare2,
                        termen_executie,
                        denum_operatie1,
                        denum_operatie2,
                        denum_operatie3,
                        denum_operatie4,
                        denum_operatie4,
                        denum_operatie5,
                        kilometri,
                        timp_operatie1,
                        timp_operatie2,
                        timp_operatie3,
                        timp_operatie4,
                        timp_operatie5,
                        denum_piesa1,
                        denum_piesa2,
                        denum_piesa3,
                        denum_piesa4,
                        denum_piesa5,
                        cant_piese1,
                        cant_piese2,
                        cant_piese3,
                        cant_piese4,
                        cant_piese5,
                        pret_piesa1,
                        pret_piesa2,
                        pret_piesa3,
                        pret_piesa4,
                        pret_piesa5
                    })
                }
            })
        }
    })
})
module.exports = router;