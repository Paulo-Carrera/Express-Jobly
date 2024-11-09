const { sqlForPartialUpdate } = require('../helpers/sql');
const { BadRequestError } = require('../expressError');

describe('sqlForPartialUpdate', () => {
  
  it('should throw an error if no data is provided', () => {
    expect(() => {
      sqlForPartialUpdate({}, {});
    }).toThrow(BadRequestError);
  });

  it('should return the correct SQL and values for partial updates', () => {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: 'first_name' };
    
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    
    expect(result.setCols).toBe('"first_name"=$1, "age"=$2');
    expect(result.values).toEqual(['Aliya', 32]);
  });

  it('should handle the case when jsToSql is not provided', () => {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    
    const result = sqlForPartialUpdate(dataToUpdate, {});
    
    expect(result.setCols).toBe('"firstName"=$1, "age"=$2');
    expect(result.values).toEqual(['Aliya', 32]);
  });

  it('should correctly map JS keys to SQL column names when jsToSql is provided', () => {
    const dataToUpdate = { firstName: 'Aliya', lastName: 'Vega' };
    const jsToSql = { firstName: 'first_name', lastName: 'last_name' };
    
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    
    expect(result.setCols).toBe('"first_name"=$1, "last_name"=$2');
    expect(result.values).toEqual(['Aliya', 'Vega']);
  });

});