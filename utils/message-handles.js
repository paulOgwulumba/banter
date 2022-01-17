function seeAllMessages(array){
    let newArray = []
    array.forEach(element => {
      let newObj = {}
      newObj = Object.assign(newObj, element)
      newObj["status"] = 2
      newArray.push(newObj)
    })
    return newArray
  }

module.exports = { seeAllMessages }