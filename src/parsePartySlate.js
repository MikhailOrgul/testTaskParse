const playWright = require('playwright')

const getParseData = async () => {
    let agenciesList = []
    const browser = await playWright['chromium'].launch({headless: false})
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('https://www.partyslate.com/find-vendors/event-planner/area/miami')

    const getAgencieName = async () => { 
        await page.waitForSelector('h1.chakra-heading css-u8kqmg')
        const eventAgencieTitle = await page.$('h1.chakra-heading css-u8kqmg')

        return eventAgencieTitle
    }

    const getAgencieLocation = async () => {
        await page.waitForSelector('p.chakra-text css-bqbbu')
        const agencieLocation = await page.$('p.chakra-text css-bqbbu')

        return agencieLocation
    }

    const getAgencieContacts = async () => {
        const contactsButton = await page.$('button.chakra-button css-15tyt09')
        await contactsButton.click()
        
        const contacts = {
            phoneNumber: await page.$('a.chakra-link css-1dvr8y4'),
            website: await page.$('a.chakra-link css-123qr35'),
        }
        page.goBack()

        return contacts
    }

    const cardsArcticlesCount = await page.$$eval('arcticle', elements => elements.length) //Количество карточек активных
    
    for(let i = 0; i < cardsArcticlesCount; i++){
        //Получение обновленного списка карточек услуг
        const cardsArcticles = await page.$$('article.src-components-CompanyDirectoryCard-styles__container__2JUdC src-pages-FindVendors-components-Results-styles__card__MdaJ_ src-components-CompanyDirectoryCard-styles__with-min-height__3NcZm')
        await cardsArcticles[i].click() //Перешел на страницу ивента 
        
        const agencieData = {
            title: await getAgencieName(), //Название агенства
            location: await getAgencieLocation(), //Местоположение
            // contacts: await getAgencieContacts(), //Объект с номером и ссылкой на сайт
        }

        agenciesList.push(agencieData)
    
        await page.goBack()    
    }
    
    console.log(agenciesList)
    // await getEventName(eventAgencies)
    
    await context.close()
    await browser.close()
}

getParseData()