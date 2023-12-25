// functions.js
// ========
module.exports = {
    millisToMinutesAndSeconds: (millis) => {
        const date = new Date(millis);
        if(date.getMinutes()){
            return `${date.getMinutes()} minutes, ${date.getSeconds()} seconds`;
        } else { 
            return `${date.getSeconds()} seconds`;
        }
    },
    getBase64data: () => {
      const usernamePasswordBuffer = Buffer.from( 
        process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
        ':' + process.env.LIFERAY_ADMIN_PASSWORD);

        return usernamePasswordBuffer.toString('base64');
    },
    getAvailableLanguages: () => {
        return [    {id:"en-US",name:"English (United States)"},
                    {id:"ar-SA",name:"العربية (المملكة العربية السعودية)"},
                    {id:"ca-ES",name:"català (Espanya)"},
                    {id:"zh-CN",name:"中文 (中国)"},
                    {id:"nl-NL",name:"Nederlands (Nederland)"},
                    {id:"fi-FI",name:"suomi (Suomi)"},
                    {id:"fr-FR",name:"français (France)"},
                    {id:"de-DE",name:"Deutsch (Deutschland)"},
                    {id:"hu-HU",name:"magyar (Magyarország)"},
                    {id:"ja-JP",name:"日本語 (日本)"},
                    {id:"pt-BR",name:"português (Brasil)"},
                    {id:"es-ES",name:"español (España)"},
                    {id:"sv-SE",name:"svenska (Sverige)"} ];
    },
    getLanguageDisplayName: (value) => {
        let lanuages = module.exports.getAvailableLanguages();

        for(let i = 0; i<lanuages.length; i++){
            if(lanuages[i].id==value)
                return lanuages[i].name;
        }

        return lanuages[0].name;
    },

};
