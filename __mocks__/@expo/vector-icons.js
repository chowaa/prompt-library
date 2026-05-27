const React = require("react");
const { Text, View } = require("react-native");

function createMockIcon(glyphMap) {
  const MockIcon = (props) =>
    React.createElement(
      View,
      { testID: `icon-${props.name || "unknown"}` },
      React.createElement(Text, null, props.name || "icon")
    );
  return MockIcon;
}

const mockIcon = createMockIcon({});

module.exports = {
  Ionicons: mockIcon,
  MaterialIcons: mockIcon,
  MaterialCommunityIcons: mockIcon,
  FontAwesome: mockIcon,
  AntDesign: mockIcon,
  Entypo: mockIcon,
  Feather: mockIcon,
  FontAwesome5: mockIcon,
  createIconSet: () => mockIcon,
};
