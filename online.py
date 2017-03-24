import pandas as pd
import numpy as np


def validateConfig(val, dtype, *conditions):
    if (type(val) != dtype):
        print 'Argument is not of type %(type)s' % {'type': dtype}
        raise TypeError   

    checked = 0
    for check in conditions:
        if callable(check):
            try:
                if (check(val)):
                    checked += 1
            except:
                print '''
                    Config value "%(value)s" violates constraints
                ''' % {'value': str(val)}
                raise
        else:
            print 'Argument should be a function'
            raise TypeError
    if (checked == len(conditions)):
        return val 
    else:
        print '''
            Not all conditions were satisfied for "%(val)s"
        ''' % {'val', val} 
        raise RuntimeError

def initialize(config): 
    numericTypes = [
        'int16',
        'int32',
        'int64',
        'float16',
        'float32',
        'float64'
    ]

    allowed = {
        'splitOn': str,
        'split': float,
        'target': str
    }

    conditions = {
        'splitOn': [ 
            lambda x, c = config: x in c['columns'],
            lambda x, c = config: c['dtypes'][x] in numericTypes
        ],
        'split': [
            lambda x: x < 1
        ],
        'target': [
            lambda x, c = config: x in c['columns'] 
        ]
    } 
    
    for param, val in config.iteritems():
        if (param in allowed.keys()):
            Environment._data['_' + param] = validateConfig(val, allowed[param], *(conditions[param]))
                         
    
def make(data, config):
    """Makes a Kaggle environment.

    Creates and configures a new environment for simulating the KaggleGym API used
    on Kaggle for code submission contests.

    Args:
        data: Pandas dataframe object containing total dataset
        config: Dictionary listing configuration data. The config object contains the
            following option:
                splitOn: The column name to split the dataframe over. Must be of
                    numerical type.       
                split: Decimal number indicating how much to split by. Defaults to
                    half.
                target: The column name that acts as the target variable for 
                    supervised learning tasks
    Returns:
        An environment object with the same API as that of the Kaggle Gym API.
        See the class definition for more detail.
    """
    config['columns'] = data.columns
    config['dtypes'] = data.dtypes
    initialize(config)

    colName = Environment._data['_splitOn']
    
    col = data[colName] # Series     

    npts = len(data[colName].unique())

    hntps = npts * Environment._data['_split'] # npoints to read to
  
    train = data[data[colName] < hntps]
    test = data[data[colName] >= hntps] 

    splitData = {
        'train': train,
        'test': test
    }

    del data 
    return Environment(splitData) 
    
class Environment(object):
    
    _stepCount = 0
    _data = {} 

    def __init__(self, data):
        self.observations = {}

        train = data['train']
        features = train[[x for x in train.columns if x not in list(Environment._data['_target'])]]
        target = train[Environment._data['_target']]

        self.observations['train'] = train 
        self.observations['features'] = features 
        self.observations['target'] = target 
     
        self.test = data['test']

    def reset(self):
        _stepCount = 0      

    def step():
        pass 
