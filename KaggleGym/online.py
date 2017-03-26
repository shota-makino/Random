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
                'id': A string indicating the column that identifies 
                    the given data you are trying to predict for
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
        'id': str
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
        ],
        'id': [
            lambda x, c = config: x in c['columns']
        ]
    } 
    
    nParams = 0 
    for param, val in config.iteritems():
        if (param in allowed.keys()):
            Environment._options['_' + param] = validateConfig(val, allowed[param], *(conditions[param]))
            nParams += 1
        if (param == 'reward'): # cannot type check for func so add as special case
            if (callable(config[param])):
                Environment._options['_reward'] = config[param]
            nParams += 1     

    # raise error if config is missing
    if (nParams != len(allowed)):
        for param, _ in allowed.iteritems():
            if param not in config.keys():
                print "%(parameter)s missing in config" % {'parameter': param} 
                raise 

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
                id: The column that identifies the piece of data that you are
                    predicting the target variable for
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
    hntps = int(npts * Environment._options['_split']) # npoints to read to
  
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
        actuals = self.observations._actuals        

        rewardArg = {
            'train': self.observations._train,
            'prediction': predictions,
            'actual': actuals
        }   

    
        reward = options['_reward'](rewardArg)

        self.observations.nextObservation()
        done = self.observations.isDone()
       
        return (self.observations, reward, done, {})

class Observation(object):
    _isClassVarSet = False
    _train = None
    _test = None

    _steps = None
    _stepCount = 0
    _step = None
    
    _colId = None
    _colStep = None
    _colTarget = None
    _colFeatures = None

    def __init__(self, data, options):
        if (not Observation._train):
            self.train = Observation._train = data['train']          
        else:
            self.train = Observation._train
    
        self.makeObservation(Observation._stepCount)

        Observation._test = data['test'] 

        # get the actual values to step by
        Observation._steps = Observation._test[options['_splitOn']].unique()
        Observation._step = Observation._steps[Observation._stepCount]

        Observation._colId = options['_id']
        Observation._colStep = options['_splitOn']
        Observation._colTarget = options['_target']
        Observation._colFeatures = [
            x for x in self.train.columns if x not in list(Observation._colTarget)
        ]

        Observation._isClassVarSet = True        

        # feed the step value to search in dataframe
        # call after class variables have been set
        self.makeObservation(Observation._step)


    def nextObservation(self):
        # make sure observations didn't run out
        if (not self.isDone()):
            self.makeObservation(self.nextStep())

    def setStep(self, num):
        if (not Observation._isClassVarSet):
            return

        Observation._stepCount = num

    def makeObservation(self, step):
        if (not Observation._isClassVarSet):
            return  

        segment = Observation._test[    
            Observation._test[Observation._colStep] == step
        ]

        features = segment[Observation._colFeatures]

        self.features = features
        self.makeTarget(segment) # should always be called when making observation

        return features

    def makeTarget(self, segment):
        if (not Observation._isClassVarSet):
            return

        ids = segment['id'].unique()
        targetVals = np.zeros(len(ids))        

        target = pd.DataFrame.from_items(
            [(Observation._colId, ids), (Observation._colTarget, targetVals)]
        ).sort([Observation._colId])

        self.target = target

        self._actuals = segment[
            [Observation._colId, Observation._colTarget]
        ].sort([Observation._colId])

        return target

    def nextStep(self):
        if (not Observation._isClassVarSet):
            return

        Observation._stepCount += 1
        return Observation._stepCount

    def isDone(self):
        if (not Observation._isClassVarSet):
            return

        return Observation._stepCount == len(Observation._steps)
