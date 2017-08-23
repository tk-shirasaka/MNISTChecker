import tensorflow as tf
import numpy as np
import os

BATCH_SIZE = 1
IMAGE_SIZE = 28
NUM_CHANNELS = 1
NUM_LABELS = 10
SEED = 42

s = tf.InteractiveSession()
base = os.path.dirname(os.path.abspath(__file__))

class ML:
    train_data_node = tf.placeholder(tf.float32, shape=(BATCH_SIZE, IMAGE_SIZE, IMAGE_SIZE, NUM_CHANNELS))

    conv1_weights = tf.Variable(tf.truncated_normal([5, 5, NUM_CHANNELS, 32], stddev=0.1, seed=SEED))
    conv1_biases = tf.Variable(tf.zeros([32]))
    conv2_weights = tf.Variable(tf.truncated_normal([5, 5, 32, 64], stddev=0.1, seed=SEED))
    conv2_biases = tf.Variable(tf.constant(0.1, shape=[64]))

    fc1_weights = tf.Variable(tf.truncated_normal([IMAGE_SIZE // 4 * IMAGE_SIZE // 4 * 64, 512], stddev=0.1, seed=SEED))
    fc1_biases = tf.Variable(tf.constant(0.1, shape=[512]))
    fc2_weights = tf.Variable(tf.truncated_normal([512, NUM_LABELS], stddev=0.1, seed=SEED))
    fc2_biases = tf.Variable(tf.constant(0.1, shape=[NUM_LABELS]))

    conv = tf.nn.conv2d(train_data_node, conv1_weights, strides=[1, 1, 1, 1], padding='SAME')
    relu = tf.nn.relu(tf.nn.bias_add(conv, conv1_biases))
    pool = tf.nn.max_pool(relu, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
    conv = tf.nn.conv2d(pool, conv2_weights, strides=[1, 1, 1, 1], padding='SAME')
    relu = tf.nn.relu(tf.nn.bias_add(conv, conv2_biases))
    pool = tf.nn.max_pool(relu, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')

    pool_shape = pool.get_shape().as_list()
    reshape = tf.reshape(pool, [pool_shape[0], pool_shape[1] * pool_shape[2] * pool_shape[3]])
    hidden = tf.nn.relu(tf.matmul(reshape, fc1_weights) + fc1_biases)
    predection = tf.nn.softmax(tf.matmul(hidden, fc2_weights) + fc2_biases)

    def setdata(self, data):
        data = tf.read_file(data)
        data = tf.image.decode_png(data, channels=1)
        data = tf.image.resize_images(data, [IMAGE_SIZE, IMAGE_SIZE])
        data = s.run(data)
        data = (data.astype(np.float32) - 255) / -255
        self.data = data.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 1])

        return self

    def run(self):
        tf.train.Saver().restore(s, os.path.join(base, 'model/mnist'))
        result = s.run(self.predection, feed_dict={self.train_data_node: self.data})

        return np.vectorize(lambda f:'%5.2f' % (f * 100))(result).reshape(10).tolist()
