const xlsx = require('xlsx')

const getXLSX = async (list) => {
    const worksheet = xlsx.utils.json_to_sheet(list)

    const workbook = xlsx.utils.book_new()

    xlsx.utils.book_append_sheet(workbook, worksheet, 'agencies')

    await xlsx.writeFile(workbook, 'agencies.xlsx')
}

module.exports = { getXLSX }