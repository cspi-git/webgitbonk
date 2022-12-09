(async()=>{
    "use strict";

    // Dependencies
    const randomUserAgent = require("random-useragent")
    const { runJobs } = require("parallel-park")
    const request = require("request-async")
    const fs = require("fs")
    
    // Variables
    const args = process.argv.slice(2)
    const vulnerableURLS = []
    
    // Main
    if(!args.length) return console.log("usage: node index.js <inputFile> <outputFile>")
    if(!args[0]) return console.log("Invalid inputFile.")
    if(!args[1]) return console.log("Invalid outputFile.")

    const urls = fs.readFileSync(args[0], "utf8").replace(/\r/g, "").split("\n").map((url)=>{
        return `${url}.git`
    })

    if(!urls.length) return console.log("No urls found.")

    console.log(`${urls.length} urls found.`)
    
    console.log("Scanning, please wait...")
    await runJobs(
        urls,
        async(url)=>{
            var response = await request(url, {
                headers: {
                    "user-agent": randomUserAgent.getRandom()
                }
            })

            response = response.body
            
            if(response.match("Index of /.git")){
                console.log("Vulnerable:", url)
                vulnerableURLS.push(url)
            }else{
                console.log("Not vulnerable:", url)
            }
        },
        {
            concurrency: 50
        }
    )

    if(!vulnerableURLS.length) return console.log("No vulnerable URLs found.")

    console.log(`${vulnerableURLS.length} vulnerable URLs found.`)
    fs.writeFileSync(args[1], vulnerableURLS.join("\n"), "utf8")
    console.log("Finished.")
})()