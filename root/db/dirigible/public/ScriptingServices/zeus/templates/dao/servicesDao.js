/* globals $ */
/* eslint-env node, dirigible */

var database = require('db/database');
var datasource = database.getDatasource();
var serviceTypesDao = require('zeus/templates/dao/serviceTypesDao');

// Create an entity
exports.create = function(entity) {
    var connection = datasource.getConnection();
    try {
        var sql = 'INSERT INTO ZEUS_SERVICE_TEMPLATES (ID,NAME,DESCRIPTION,PORT,TYPE,DEPLOYMENT_TEMPLATE_ID) VALUES (?,?,?,?,?,?)';
        var statement = connection.prepareStatement(sql);
        var i = 0;
        var id = datasource.getSequence('ZEUS_SERVICE_TEMPLATES_ID').next();
        statement.setInt(++i, id);
        statement.setString(++i, entity.name);
        statement.setString(++i, entity.description);
        statement.setInt(++i, entity.port);
        statement.setInt(++i, entity.type);
        statement.setInt(++i, entity.deployment_template_id);
        statement.executeUpdate();
    	return id;
    } finally {
        connection.close();
    }
};

// Return a single entity by Id
exports.get = function(id) {
	var entity = null;
    var connection = datasource.getConnection();
    try {
        var sql = 'SELECT * FROM ZEUS_SERVICE_TEMPLATES WHERE ID = ?';
        var statement = connection.prepareStatement(sql);
        statement.setInt(1, id);

        var resultSet = statement.executeQuery();
        if (resultSet.next()) {
            entity = createEntity(resultSet);
        }
    } finally {
        connection.close();
    }
    return entity;
};

// Return all entities
exports.list = function(limit, offset, sort, desc, deploymentTemplateId, getTypeName) {
    var result = [];
    var connection = datasource.getConnection();
    try {
        var sql = 'SELECT ';
        if (limit !== null && offset !== null) {
            sql += ' ' + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += ' * FROM ZEUS_SERVICE_TEMPLATES';
        if (deploymentTemplateId !== undefined && deploymentTemplateId !== null) {
        	sql += ' WHERE DEPLOYMENT_TEMPLATE_ID = ?';
        }
        if (sort !== null) {
            sql += ' ORDER BY ' + sort;
        }
        if (sort !== null && desc !== null) {
            sql += ' DESC ';
        }
        if (limit !== null && offset !== null) {
            sql += ' ' + datasource.getPaging().genLimitAndOffset(limit, offset);
        }
        var statement = connection.prepareStatement(sql);
        if (deploymentTemplateId !== undefined && deploymentTemplateId !== null) {
        	statement.setInt(1, deploymentTemplateId);
    	}
        var resultSet = statement.executeQuery();
        while (resultSet.next()) {
            result.push(createEntity(resultSet, getTypeName));
        }
    } finally {
        connection.close();
    }
    return result;
};

// Update an entity by Id
exports.update = function(entity) {
    var connection = datasource.getConnection();
    try {
        var sql = 'UPDATE ZEUS_SERVICE_TEMPLATES SET NAME = ?,DESCRIPTION = ?,PORT = ?,TYPE = ?,DEPLOYMENT_TEMPLATE_ID = ? WHERE ID = ?';
        var statement = connection.prepareStatement(sql);
        var i = 0;
        statement.setString(++i, entity.name);
        statement.setString(++i, entity.description);
        statement.setInt(++i, entity.port);
        statement.setInt(++i, entity.type);
        statement.setInt(++i, entity.deployment_template_id);
        var id = entity.id;
        statement.setInt(++i, id);
        statement.executeUpdate();
    } finally {
        connection.close();
    }
};

// Delete an entity
exports.delete = function(entity) {
    var connection = datasource.getConnection();
    try {
    	var sql = 'DELETE FROM ZEUS_SERVICE_TEMPLATES WHERE ID = ?';
        var statement = connection.prepareStatement(sql);
        statement.setString(1, entity.id);
        statement.executeUpdate();
    } finally {
        connection.close();
    }
};

// Return the entities count
exports.count = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
    	var sql = 'SELECT COUNT(*) FROM ZEUS_SERVICE_TEMPLATES';
        var statement = connection.prepareStatement(sql);
        var rs = statement.executeQuery();
        if (rs.next()) {
            count = rs.getInt(1);
        }
    } finally {
        connection.close();
    }
    return count;
};

// Returns the metadata for the entity
exports.metadata = function() {
	var metadata = {
		name: 'zeus_service_templates',
		type: 'object',
		properties: [
		{
			name: 'id',
			type: 'integer',
			key: 'true',
			required: 'true'
		},
		{
			name: 'name',
			type: 'string'
		},
		{
			name: 'description',
			type: 'string'
		},
		{
			name: 'port',
			type: 'integer'
		},
		{
			name: 'type',
			type: 'integer'
		},
		{
			name: 'deployment_template_id',
			type: 'integer'
		},
		]
	};
	return metadata;
};

// Create an entity as JSON object from ResultSet current Row
function createEntity(resultSet, getTypeName) {
    var result = {};
	result.id = resultSet.getInt('ID');
    result.name = resultSet.getString('NAME');
    result.description = resultSet.getString('DESCRIPTION');
	result.port = resultSet.getInt('PORT');
	if (getTypeName !== undefined && getTypeName !== null && getTypeName === true) {
		result.type = serviceTypesDao.get(resultSet.getInt('TYPE')).name;
	} else {
		result.type = resultSet.getInt('TYPE');
	}
	result.deployment_template_id = resultSet.getInt('DEPLOYMENT_TEMPLATE_ID');
    return result;
}

