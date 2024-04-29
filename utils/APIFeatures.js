class APIFeatures {
  //this api takes query method(query) of diff models and using req.query(query.string) it adds diff query methods to query //using this class we can create 'features ' object which has query field (query of all methods)
  constructor(query, queryObject) {
    //Model.find(),req.query
    this.query = query;
    this.queryObject = queryObject;
  }

  filter() {
    //1a)Filtering
    const queryObj = { ...this.queryObject }; //shollow copy of query object
    const exludedFields = ["search", "sort", "fields", "page", "limit"];
    exludedFields.forEach((field) => delete queryObj[field]); //exluding certian fields from query object so that we can build chained methods for them

    //1b)Advanced filtering using gte,gt,lte,lte

    // eg1-: http://localhost:3000/api/v1/users?age=18
    //req.query object will be  {age:18}
    //we need in mongodb ,const user = await User.find({ age: 18 } });
    //so,const user = await User.find(req.query);
    // eg1-: http://localhost:3000/api/v1/users?age[gte]=18
    // req.query object will be is {age:{gte :18}
    //we need in mongodb, const usersAbove18 = await User.find({ age: { $gt: 18 } });
    //here we need to add $ to gt,gte,lt and lte to req.query object then we can use in User.find(req.query) like this

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    const AdvancedQueryObj = JSON.parse(queryStr);

    this.query = this.query.find(AdvancedQueryObj); //adding query methods to "query" field of the class

    return this; //by returning this it makes chaining of diff methods on objects becomes possibles//because if we return this object then only we can add diff query methods to it by chaing diff query methods
  }

  search() {
    //searchin mongdv: Model.find({name:{$regex:'product1',$options:'i'}})//options 'i' means searching for lower as well as  uppper case letters
    const searchQueryObj = this.queryObject.search
      ? { name: { $regex: this.queryObject.search, $options: "i" } }
      : {};
    this.query = this.query.find({ ...searchQueryObj });
    return this;
  }

  sort() {
    if (this.queryObject.sort) {
      // console.log(this.queryObject.sort); //output=>price,duration  //in order to sort using multiple values we need 'query.sort('price duration') //so we need to make that camma into space
      const sortStrWithSpaces = this.queryObject.sort.split(",").join(" "); //bcz url

      // console.log(sortBy); //output=>price duration
      // query.sort(this.queryObject.sort);//to make sort in decreasing order add minus to value in url eg: http://localhost:3000/api/v1/tours?sort=-price
      this.query = this.query.sort(sortStrWithSpaces);
      //we can sort by multiple values first by price then by duration eg:http://localhost:3000/api/v1/tours?sort=price,duration
      //we seacrch like this- Model.find().sort('price duration')
    } else {
      //default sorting in decreasing order of dates of creation
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryObject.fields) {
      const fieldsStrWithSpaces = this.queryObject.fields.split(",").join(" "); //making string of feilds with space between them///bcz we search in query like this Model.find().selet('name duration price')

      this.query = this.query.select(fieldsStrWithSpaces); //looks like- this.query.select('name duration price') for eg-http://localhost:3000/api/v1/tours?fields=name,duration,price//but we search in query like this Model.find().select('name duration price')
    } else {
      //defulat condition exluding __v filed in the output//to exlude add minus to value
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate(resultsPerPage) {
    //for eg-http://localhost:3000/api/v1/tours?page=3&limit=10 -this means we want 3rd page with 10 document - so we have to skip 1st 20 document to show next 10 (20 t0 30)document -in the query we search like this-Model.find().skip(20).limit(10) to show 3rd page with 10 documents
    const page = this.queryObject.page * 1 || 1; //pages in number form with 1st page as default
    const limit = resultsPerPage * 1 || 20; //limit in number form with 20 as default
    const skip = (page - 1) * limit; //calculating skip value to skip (page-1)*limit no.of documents to display the page
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
