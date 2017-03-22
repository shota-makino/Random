import pandas as pd
import numpy as np


def validateConfig(val, dtype, *conditions):
    if (type(val) != dtype):
        print 'Argument is not of type %(type)s' % {'type': dtype}
        raise TypeError   

    checked = 0
    for check in conditions:
        if callable(check):
            if (check(val)):
                checked += 1
        else:
            print 'Argument should be a function'
            raise TypeError
    if (checked == len(conditions)):
        return val 
    else:
        print '''
            Not all conditions were satisfied for %(val)s
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
        'splitOn': (
            lambda x, c = config: x in c['columns'],
            lambda x, c = config: c['dtypes'][x] in numericTypes
        ),
        'split': (
            lambda x: x < 1
        ),
        'target': (
            lambda x, c = config: x in c['columns'] 
        )
    } 
    
    for param, val in config.iteritems():
        if (param in allowed.keys()):
            Environment['_' + param] = validateConfig(val, allowed[param], *conditions[param])
             
    
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

    colName = Environment._splitOn
    
    col = df[colName] # Series     

    npts = len(df[colName].unique())

    hntps = npts * Environment._split # npoints to read to
  
    train = df[df[colName] < hntps]
    test = df[df[colName] >= hntps] 

    data = {
        'train': train,
        'test': test
    }
     
    return Environment(data) 
    
class Environment:
    
    _stepCount = 0

    def __init__(self, data):
        self.observation = {}

        train = data.train
        features = train[[x for x in data.columns if x not in list(Environment._target)]]
        target = train[Environment._target]

        self.observations['train'] = train 
        self.observations['features'] = features 
        self.observations['target'] = target 
     
    def __setitem__(self, key, val):
        self.data[key] = val

    def __getitem__(self, key, val):
        return self.data[key]            

    def reset(self):
        _stepCount = 0       
