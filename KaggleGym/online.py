import pandas as pd
import numpy as np


def validateConfig(val, dtype, *conditions):
    '''Validates configuration input
    
    Validates a value for a given configuration property using
    lambda functions stored in conditions arg

    Args:
        val: The value to validate
        dtype: The data type of the value to check against
        *conditions: A variable list of lambdas that act
            as coniditions to satisfy against the given value val

    Returns: 
        The original value val for chained function calls 

    Raise:
        TypeError: If the type for val and the dtype do not match or
            if the condition is not a function
        RuntimeError: If not all conditions were satisfied
    ''' 
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
    ''' Initializes Environment data given config
    
    Initializes the Environment class properties to 
    config values 

    Args:
        config: A dict holding configuration variables with
            the following properties:
                'splitOn': A string containing the name of the 
                    column to split the data on
                'split': A decimal value indicating the percentage
                    of the data to reserve as training vs testing data
                'target': A string indicating the column name that
                    is to act as the target data
                'reward': A function that acts as the objective function
                    you are maximizing or minimizing
    '''
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
        'target': str,
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
            Environment._options['_' + param] = validateConfig(val, allowed[param], *(conditions[param]))
        if (param == 'reward'): # cannot type check for func so add as special case
            if (callable(config[param])):
                Environment._options['_reward'] = config[param]
  
                         
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
                reward: A function acting as the objective function you are 
                    maximizing or minimizing
    Returns:
        An environment object with the same API as that of the Kaggle Gym API.
        See the class definition for more detail.
    """
    config['columns'] = data.columns
    config['dtypes'] = data.dtypes

    initialize(config)

    colName = Environment._options['_splitOn']
    col = data[colName] # Series     

    npts = len(data[colName].unique())
    hntps = npts * Environment._options['_split'] # npoints to read to
  
    train = data[data[colName] < hntps]
    test = data[data[colName] >= hntps] 

    splitData = {
        'train': train,
        'test': test
    }
                                                                      
    del data 
    return Environment(splitData) 
    
class Environment(object):
    '''Kaggle environment containing configurations and data to simulate code submissions

    Simulates the KaggleGym API for local development so that you can see your results
    before making a submission. This will be advantageous for users so that they
    can give meaningful submissions and can utilize whatever local development
    setup they choose.

    Args:
        data: An object containing both training and testing data segments
            train: Pandas dataframe training dataset
            test: Pandas dataframe testing dataset
    ''' 
    _options = {} 

    def __init__(self, data):
        self.observations = Observation(data, Environment._options)

    def reset(self):
        self.observations.setStep(0)
        return self.observations

    def step(self, predictions):
        options = Environment._options
        test = self.test
        col = options['_splitOn']

        if (not '_steps' in options):
            steps = test[options['_splitOn']].unique()
            options['_steps'] = steps 

        steps = options['_steps']
        nextObs = test[test[col] == steps[_stepCount]]

        rewardArg = {
            'train': self.observations['train'],
            'actual': nextObs,
            'predictions': predictions
        }   

        reward = options['reward'](rewardArg)
        done = False
       
        if (len(steps) == _stepCount):
            done = True
        
        return (nextObs, reward, done, {})

class Observation():
    _train = None
    _test = None

    def __init__(self, data, options):
        if (not Observation._train):
            self.train = Observation._train = data.train          
        else:
            self.train = Observation._train
    
        if (not Observation._test):
            self.test = Observation._test = data.test 
        else:
            self.test = Observation._test   

        self.steps = self.test[options['_splitOn']].unique()
        self.stepCount = 0 
        self.step = self.steps[self.stepCount]

        self.colStep = options['_splitOn']
        self.colTarget = options['_target']
        self.colFeatures = [
            x for x in self.train.columns if x not in list(self.colTarget)
        ]

    def reset(self, num):
        self.stepCount = num

    def makeNextObservation(self, step):
        features = self.test[
            self.test[self.colStep] == step]
        ][self.colFeatures]

