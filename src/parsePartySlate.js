const playWright = require('playwright')

const getParseData = async () => {
    let agenciesList = []
    const browser = await playWright['chromium'].launch({headless: false})
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('https://www.partyslate.com/find-vendors/event-planner/area/miami')

    const htmlClasses = {
        companyName: 'h1.chakra-heading',
        location: 'hgroup p.chakra-text.css-bqbbu',
        contactPerson: 'h3.chakra-heading.css-1ham2m0',
        minimumSpend: 'dd.css-1nmdp34',
        jobTitle: 'p.chakra-text.css-26u3r1',
        phoneNumber: 'a.chakra-link.css-1dvr8y4',
        website: 'a.chakra-link.css-123qr35',
        instagram: 'a.chakra-link.css-6cxgxb',
        facebook: 'a.chakra-link.css-6cxgxb'
    }

    const getSimpleParsedData = async (newPage, className) => {
        const element = await newPage.$(className)
        if (!element) return 'No data'
        return await element.textContent()
    }

    const getHref = async (newPage, className) => {
        const element = await newPage.$(className)
        if (!element) return 'No data'
        return await element.getAttribute('href')
    }

    const getAgencieContacts = async (newPage) => {
        const contactsButton = await newPage.$('button.chakra-button.css-15tyt09')
        await contactsButton.click()
        
        await newPage.waitForSelector('a')

        const contacts = {
            phoneNumber: await getSimpleParsedData(newPage, htmlClasses.phoneNumber),
            website: await getSimpleParsedData(newPage, htmlClasses.website),
            instagram: await getHref(newPage, htmlClasses.instagram),
            facebook: await getHref(newPage, htmlClasses.facebook),
        }

        return contacts
    }

    //Получение количества карточек мероприятий из списка
    await page.waitForFunction(() => document.querySelectorAll('article').length > 20)
    const cardsArticlesCount = await page.$$eval('article.src-components-CompanyDirectoryCard-styles__container__2JUdC', elements => elements.length) //Количество карточек активных

    for(let i = 0; i < cardsArticlesCount; i++){
        console.log('[INFO]', `Страница с карточкой ${i+1}`)
        
        //Получение обновленного списка карточек услуг
        await page.waitForSelector('article')
        const cardsArticles = await page.$$('article.src-components-CompanyDirectoryCard-styles__container__2JUdC')

        //Переход на страницу ивента 
        const pagePromise = context.waitForEvent('page')
        await cardsArticles[i].click()
        const newPage = await pagePromise
        
        //Ожидание загрузки нужных элементов
        await newPage.waitForSelector('h1.chakra-heading')
        await newPage.waitForSelector('p.chakra-text')
        await newPage.waitForSelector('button.chakra-button')
        
        //может не быть данных
        const contactPersonElement = await newPage.$('h3.chakra-heading.css-1ham2m0')
        if(contactPersonElement) await newPage.waitForSelector('h3.chakra-heading.css-1ham2m0')
        
        await newPage.waitForSelector('p.chakra-text.css-26u3r1')

        //Объект данных из карточки агенства
        const agencieData = {
            companyName: await getSimpleParsedData(newPage, htmlClasses.companyName),
            location: await getSimpleParsedData(newPage, htmlClasses.location),
            contacts: await getAgencieContacts(newPage, getSimpleParsedData),
            contactPerson: await getSimpleParsedData(newPage, htmlClasses.contactPerson), 
            minimumSpend: await getSimpleParsedData(newPage, htmlClasses.minimumSpend),
            jobTitle: await getSimpleParsedData(newPage, htmlClasses.jobTitle),
        }

        console.log(agencieData)

        agenciesList.push(agencieData)
        
        await newPage.close()
    }
    
    console.log(agenciesList)
    
    await context.close()
    await browser.close()
}

getParseData()