const { getParseData } = require('./src/parsePartySlate')
const { getXLSX } = require('./src/exelBuilder')

const main = async () => {
    const list = await getParseData()
    getXLSX(list)
}

main()