import os
import numpy as np
import cv2
import torch
import torch.nn.functional as F
from skimage import io
import torch.nn as nn
import torch.nn.init as init
import torchvision
from torchvision import models
import matplotlib.pyplot as plt
from collections import namedtuple
from packaging import version
from collections import OrderedDict

from segmentation_utils import *


folder_path = "/mnt/cai-data/manuscript-annotation-tool/manuscripts/MV/leaves"
m_name = folder_path.split('/')[-2]
device = torch.device('cuda') #change to cpu if no gpu

























def segment(path):
    pass

segment(input())