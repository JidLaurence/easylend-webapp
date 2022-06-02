var Users = require('../database/models/users');
var Staffs = require('../database/models/staff');

module.exports = async (req, res) => {
        let company_id;
        
        let credentials = await Users.findOne(
            {_id: req.auth.credentials._id}
            ).lean();
        
        //GET COMPANY ID OF STAFF
      
        if(credentials.isHired==true && credentials.scope[0]=='staff'){
            company_id = await Staffs.findOne({
                staff_id: credentials._id,
                isCancel: false,
                isVoid: false
            }).lean();
        }
        if(company_id!=null){
            credentials.company_id=company_id.company_id;
        }

        req.auth.credentials = credentials;
        await req.cookieAuth.clear();
        await req.cookieAuth.set(credentials);
}