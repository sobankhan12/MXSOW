const express = require('express')
const puppeteer = require('puppeteer');
var cors = require('cors')
const app = express()
const sowTemplate = require('./src/templates/sowTemplate.js')
const invoiceTemplate = require('./src/templates/invoiceTemplate.js')
const quotationTemplate = require('./src/templates/quotationTemplate.js')
var fs = require("fs");

port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors())





async function createPDF(html, file) {
    const browser = await puppeteer.launch();
    // const browser = await puppeteer.launch({ executablePath: '/snap/bin/chromium' });

    const page = await browser.newPage();
    await page.setContent(html)
    await page.pdf({ path: file });
    await browser.close();
    console.log('file created successful!');
    return
}


app.post('/file/sow', (req, res) => {

    (async () => {
        var data = await req.body
        var file = data.UserName + "-SOW.pdf"
        try {
            var supportEmail = ""
            var userEmail = ""
            var packageName = ""
            var terms = ""

            try {
                data.supportEmail.map((n) => {
                    supportEmail = supportEmail + `<p style="font-size: 12pt;"> ${n} </p>`
                })
            } catch (error) {
                supportEmail = data.supportEmail
            }

            try {
                data.userEmail.map((n) => {
                    userEmail = userEmail + `<p style="font-size: 12pt;"> ${n} </p>`
                })
            } catch (error) {
                userEmail = data.userEmail
            }

            try {
                data.packageName.map((n) => {
                    packageName = packageName + `<p style="font-size: 12pt;"> ${n} </p>`
                })
            } catch (error) {
                packageName = data.packageName
            }

            try {
                data.terms.map((n) => {
                    terms = terms + `<li style='margin: 5px 0px;'> ${n} </li>`
                })
            } catch (error) {
                terms = data.terms
            }

            var date = new Date().toUTCString();

            html = sowTemplate.replace("{{user/company name}}", data.UserName)
                .replace("{{Customer name}}", data.UserName)
                .replace("{{Enter date here}}", date)
                .replace("{{ref# for tracking}}", data.RefNum)
                .replace("{{Service name}}", data.ServiceName)
                .replace("{{Sub-Service name}}", data.SubServiceName.toString().replace(/,/g, ', '))
                .replace("{{Package Name}}", packageName)
                .replace("{{concern department point of contact name}}", supportEmail)
                .replace("{{concern email id}}", userEmail)
                .replace("{{international phone#}}", data.userPhone)
                .replace("{{date and time stamp of user’s service activity}}", date)
                .replace("{{Same date of SOW generation}}", date)
                .replace("{{Terms 1}}", terms)

            createPDF(html, file).then(async () => {

                fs.readFile(file, function (err, fileBuffer) {
                    if (err) throw err;
                    fs.unlinkSync(file)
                    console.log('deleted successful!');
                    res.status(200).send(fileBuffer)
                });
            })
        }
        catch (err) {
            res.status(404).send(err.toString())
        }
    })();
})

app.post('/PrintInvoice', (req, res) => {
    (async () => {
        var data = await req.body
        var file = data.UserName + "-Invoice.pdf"
        try {

            var year = new Date().getFullYear();
            var packageDetails = ""
            try {
                data.services.map((service) => {
                    packageDetails = packageDetails + `<div class="custom-table-row">
                    <div class="custom-table-col is-double">
                        <span>${service.packageName}</span>
                    </div>
                    <div class="custom-table-col">
                        <span>${service.packageQuantity}</span>
                    </div>
                    <div class="custom-table-col">
                        <span>${service.packagePrice}</span>
                    </div>
                    <div class="custom-table-col">
                        <span></span>
                    </div>
                </div>`
                })
            } catch (error) {
                packageDetails = data.services
            }


            html = invoiceTemplate.replace("{{Invoice}}", "Invoice")
                .replace("{{customer name}}", data.customerName)
                .replace("{{email}}", data.customerEmail)
                .replace("{{order date}}", data.orderDate)
                .replace("{{quotation ref}}", data.quotationRef)
                .replace("{{package_details}}", packageDetails)
                .replace("{{total price}}", data.totalPrice)
                .replace("{{year}}", year)


            createPDF(html, file).then(async () => {

                fs.readFile(file, function (err, fileBuffer) {
                    if (err) throw err;
                    fs.unlinkSync(file)
                    console.log('deleted successful!');
                    res.status(200).send(fileBuffer)
                });
            })
        }
        catch (err) {
            res.status(404).send(err.toString())
        }
    })();
})


app.post('/PrintQuotation', (req, res) => {
    (async () => {
        var data = await req.body
        var file = data.refNum + "-Quotation.pdf"
        try {

            var subServiceName = ""
            var packageName = ""
            var price = ""
            var terms = ""

            try {
                data.subServiceNames.map((n) => {
                    subServiceName = subServiceName + `<li>${n}<i class="fa fa-trash delete-icon"></i></li>`
                })
            } catch (error) {
            }

            try {
                data.packageNames.map((n) => {
                    packageName = packageName + `<li>${n}</li>`
                })
            } catch (error) {
            }

            try {
                data.prices.map((n) => {
                    price = price + `<li>${n}</li>`
                })
            } catch (error) {
            }

            try {
                data.termsAndConditions.map((n) => {
                    terms = terms + `<li>${n}</li>`
                })
            } catch (error) {
                terms = data.termsAndConditions
            }

            html = quotationTemplate.replace("{{refNum}}", data.refNum)
                .replace("{{serviceName}}", data.serviceName)
                .replace("{{subServiceName}}", subServiceName)
                .replace("{{packageName}}", packageName)
                .replace("{{packagePrice}}", price)
                .replace("{{totalPrice}}", data.totalPrice)
                .replace("{{termsAndConditions}}", terms)

            createPDF(html, file).then(async () => {

                fs.readFile(file, function (err, fileBuffer) {
                    if (err) throw err;
                    fs.unlinkSync(file)
                    console.log('deleted successful!');
                    res.status(200).send(fileBuffer)
                });
            })

        }
        catch (err) {
            res.status(404).send(err.toString())
        }
    })();
})


app.get('/', (req, res) => {
    res.status(200).send(`PDF service is up & running.`);
})

app.listen(port, () => {
    console.log(`PDF service listening on port : ${port}`)
})

